import * as mindee from "mindee";
import type { EventHandlerRequest, H3Event } from "h3";
import type { OcrProvider } from "../ocr.interface";
import type {
    OcrSubmitOptions,
    OcrSubmitResult,
    OcrWebhookPayload,
} from "~~/shared/types/providers/ocr/types";

/**
 * Mindee Invoice API (predict v4)
 * Docs: https://developers.mindee.com/docs/invoice
 * Webhook signature header: `Mindee-Signature: t=...,v1=...`
 */
export class MindeeRepository implements OcrProvider {
    private MINDEE_API_KEY = process.env.MINDEE_API_KEY;
    private MINDEE_MODEL_ID = process.env.MINDEE_MODEL_ID;
    private MINDEE_WEBHOOK_ID = process.env.MINDEE_WEBHOOK_ID;
    private MINDEE_WEBHOOK_SECRET = process.env.MINDEE_WEBHOOK_SECRET;

    private checkConfig() {
        if (!this.MINDEE_API_KEY) {
            throw new Error("Mindee API key is not configured");
        }
        if (!this.MINDEE_MODEL_ID) {
            throw new Error("Mindee Model ID is not configured");
        }
        if (!this.MINDEE_WEBHOOK_ID) {
            throw new Error("Mindee Webhook secret is not configured");
        }
        if (!this.MINDEE_WEBHOOK_SECRET) {
            throw new Error("Mindee Webhook secret is not configured");
        }
    }

    async submitBuffer(
        input: Uint8Array,
        filename: string,
        opts: OcrSubmitOptions,
    ): Promise<OcrSubmitResult> {
        throw new Error("Not implemented");
        // const form = new FormData();
        // form.append("document", new Blob([input]), filename);
        // // Mindee supporte un paramètre de callback (alias depends du compte) :
        // // soit via l'app Mindee (Dashboard callback), soit via params/metadatas:
        // // Pour rester générique, on passe metadata (puis on matchera côté webhook)
        // form.append("include_words", "false");
        // // Tips: passer des metadatas utiles pour retrouver l’établissement & invoice
        // form.append(
        //     "metadata",
        //     JSON.stringify({
        //         establishmentId: opts.establishmentId,
        //         invoiceId: opts.invoiceId ?? null,
        //         callbackUrl: opts.callbackUrl,
        //     }),
        // );

        // const res = await fetch(this.endpoint, {
        //     method: "POST",
        //     headers: { "Authorization": `Token ${this.apiKey}` },
        //     body: form,
        // });
        // if (!res.ok) throw new Error(`Mindee submit error ${res.status}`);
        // const json = await res.json();
        // // Mindee renvoie un "job" quand mode async est activé (selon le produit/plan)
        // const jobId = json?.job?.id ?? json?.document?.id ??
        //     crypto.randomUUID(); // fallback
        // return { jobId, provider: "mindee" };
    }

    async submitUrl(
        url: string,
        opts: OcrSubmitOptions,
    ): Promise<OcrSubmitResult> {
        this.checkConfig();
        if (
            !this.MINDEE_API_KEY || !this.MINDEE_MODEL_ID ||
            !this.MINDEE_WEBHOOK_ID
        ) {
            throw createError({
                status: 500,
                message: "OCR service is not configured",
            });
        }
        const mindeeClient = new mindee.ClientV2({
            apiKey: this.MINDEE_API_KEY,
        });
        const loadedDocument = new mindee.UrlInput({ url });
        await loadedDocument.init();
        const { job } = await mindeeClient.enqueueInference(
            loadedDocument,
            {
                modelId: this.MINDEE_MODEL_ID,
                webhookIds: [this.MINDEE_WEBHOOK_ID!],
                alias: opts.invoiceId,
            },
        );
        if (!job) {
            throw createError({
                status: 500,
                message: "Failed to process the document",
            });
        }
        return { jobId: job.id };
    }

    async parseWebhook(
        event: H3Event<EventHandlerRequest>,
    ): Promise<OcrWebhookPayload> {
        this.checkConfig();
        const sig = getHeader(event, "X-Signature") || "";
        const raw = await readRawBody(event, "utf8");

        console.log("Mindee Webhook received, signature:", sig);
        console.log("Raw body:", raw);

        if (!raw) {
            throw createError({
                statusCode: 400,
                statusMessage: "Empty body",
            });
        }

        // 3) HMAC verify using raw
        const lr = new mindee.LocalResponse(raw);
        await lr.init();
        const ok = lr.isValidHmacSignature(
            process.env.MINDEE_WEBHOOK_SECRET!,
            sig,
        );
        if (!ok) {
            throw createError({
                statusCode: 401,
                statusMessage: "Invalid signature",
            });
        }

        // 4) Only now parse JSON if you need to
        const payload = JSON.parse(raw || "{}");

        const jobId = payload?.job?.id ??
            payload?.document?.id ??
            payload?.inference?.id ??
            null;

        const {
            invoiceNumber,
            totalAmount,
            currency,
            dueDate,
        } = extractInvoiceFields(payload);

        return {
            isValid: true,
            jobId,
            prediction: {
                invoiceNumber,
                totalTtc: totalAmount,
                currency,
                dueDate,
            },
            raw: payload,
        };
    }
}

function getHeader(event: any, name: string): string | null {
    const v = event.node?.req?.headers?.[name] ??
        event.node?.req?.headers?.[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v ?? null;
}

/**
 * Supports both:
 *  - Prebuilt Invoice v4 => payload.document.inference.prediction
 *  - V2/custom schema    => payload.inference.result.fields (map or array)
 */
function extractInvoiceFields(payload: any) {
    // A) Prebuilt invoice v4 (common path)
    const pred = payload?.document?.inference?.prediction;
    if (pred) {
        return {
            invoiceNumber: pred?.invoice_number?.values?.[0]?.content ??
                pred?.invoice_number?.value ?? null,
            totalAmount: pred?.total_amount?.value ?? pred?.total_incl?.value ??
                null,
            currency: pred?.total_amount?.currency ?? null,
            dueDate: pred?.due_date?.value ?? null,
        };
    }

    // B) V2/custom: inference.result.fields
    const fields = payload?.inference?.result?.fields;
    if (fields) {
        // fields can be a Map-like object or an array of { name, value, ... }
        const getSimple = (name: string) => {
            // object style
            if (fields[name]?.value !== undefined) return fields[name].value;
            if (fields[name]?.stringValue !== undefined) {
                return fields[name].stringValue;
            }
            if (fields[name]?.numberValue !== undefined) {
                return fields[name].numberValue;
            }

            // array style
            if (Array.isArray(fields)) {
                const f = fields.find((x: any) => x?.name === name);
                if (!f) return null;
                return f.value ?? f.stringValue ?? f.numberValue ?? null;
            }
            return null;
        };

        // sometimes currency is nested (e.g., locale.currency)
        const getNestedCurrency = () => {
            const locale = fields["locale"]?.fields ||
                (Array.isArray(fields)
                    ? fields.find((x: any) => x?.name === "locale")?.fields
                    : null);
            if (!locale) return null;

            if (Array.isArray(locale)) {
                const c = locale.find((x: any) => x?.name === "currency");
                return c?.value ?? c?.stringValue ?? null;
            }
            return locale["currency"]?.value ??
                locale["currency"]?.stringValue ?? null;
        };

        return {
            invoiceNumber: getSimple("invoice_number"),
            totalAmount: getSimple("total_amount"),
            currency: getSimple("currency") ?? getNestedCurrency(),
            dueDate: getSimple("due_date"),
        };
    }

    // Unknown schema
    return {
        invoiceNumber: null,
        totalAmount: null,
        currency: null,
        dueDate: null,
    };
}

import type { OcrProvider } from "../provider";
import type {
    OcrPrediction,
    OcrSubmitOptions,
    OcrSubmitResult,
    OcrWebhookPayload,
} from "../types";
import { readRawBody } from "h3";
import { ClientV2, InputSource, internal, LocalResponse } from "mindee";

/**
 * Mindee Invoice API (predict v4)
 * Docs: https://developers.mindee.com/docs/invoice
 * Webhook signature header: `Mindee-Signature: t=...,v1=...`
 */
export class MindeeProvider implements OcrProvider {
    private endpoint =
        "https://api.mindee.net/v1/products/mindee/invoices/v4/predict";
    private MINDEE_API_KEY = process.env.MINDEE_API_KEY;
    private MINDEE_MODEL_ID = process.env.MINDEE_MODEL_ID;
    private webhookSecret = process.env.MINDEE_WEBHOOK_SECRET!; // configuré dans le dashboard Mindee

    private checkConfig() {
        if (!this.MINDEE_API_KEY) {
            throw new Error("Mindee API key is not configured");
        }
        if (!this.MINDEE_MODEL_ID) {
            throw new Error("Mindee Model ID is not configured");
        }
        if (!this.webhookSecret) {
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
        const inputSource = new internal.input.PathInput({
            inputPath: url,
        });
        if (!this.MINDEE_API_KEY || !this.MINDEE_MODEL_ID) {
            throw createError({
                status: 500,
                message: "OCR service is not configured",
            });
        }
        const mindeeClient = new ClientV2({ apiKey: this.MINDEE_API_KEY });
        const { job } = await mindeeClient.enqueueInference(
            inputSource,
            {
                modelId: this.MINDEE_MODEL_ID,
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

    async parseWebhook(event: any): Promise<OcrWebhookPayload> {
        const signatureHeader = getHeader(event, "mindee-signature") || "";
        const body = await readBody(event);
        const localResponse = new LocalResponse(body);
        await localResponse.init();
        const isValid = localResponse.isValidHmacSignature(
            "obviously-fake-secret-key",
            signatureHeader,
        );
        if (!isValid) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
            });
        }
        // Le corps JSON Mindee
        const jobId: string | undefined = body?.job?.id ?? body?.document?.id;

        // Mapping vers notre format commun
        const p = body?.document?.inference?.prediction ?? {};
        const pred: OcrPrediction = {
            invoiceNumber: p?.invoice_number?.values?.[0]?.content ?? null,
            totalTtc: p?.total_amount?.value ?? null,
            currency: p?.total_amount?.currency ?? null,
            dueDate: p?.due_date?.value ?? null,
            providerRaw: body,
        };

        return { isValid: true, jobId, prediction: pred, raw: body };
    }
}

// util H3
function getHeader(event: any, name: string): string | null {
    const v = event.node?.req?.headers?.[name] ??
        event.node?.req?.headers?.[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v ?? null;
}

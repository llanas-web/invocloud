import { serverServiceRole } from "~~/server/lib/supabase/client";
import { OcrProviderName } from "~~/server/lib/ocr/types";
import { getOcrProvider } from "~~/server/lib/ocr/factory";
import createInvoiceRepository from "#shared/repositories/invoice.repository";

export default defineEventHandler(async (event) => {
    const providerName = (getQuery(event).provider as OcrProviderName) ??
        "mindee";
    const provider = getOcrProvider(providerName);
    const supabaseServiceRole = serverServiceRole(event);
    const invoiceRepository = createInvoiceRepository(supabaseServiceRole);

    const { isValid, jobId, prediction, raw } = await provider.parseWebhook(
        event,
    );

    if (!isValid) {
        if (!jobId) {
            throw createError({ status: 400, message: "Invalid jobId" });
        } else {
            supabaseServiceRole.from("invoice_jobs").update({
                status: "error",
                error_message: "Invalid webhook",
            }).eq("job_id", jobId!);
            throw createError({ status: 400, message: "Invalid webhook" });
        }
    }

    console.log("OCR Webhook received for jobId:", jobId);
    if (jobId && prediction) {
        console.log("predictions: ", prediction);
        const { data: jobData, error: jobError } = await supabaseServiceRole
            .from("invoice_jobs")
            .update({
                status: "done",
                raw_result: typeof raw === "object" ? JSON.stringify(raw) : raw,
            }).eq("job_id", jobId!).select().maybeSingle();
        if (jobError || !jobData) {
            throw createError({ status: 404, message: "Job not found" });
        }
        await invoiceRepository.updateInvoice(jobData?.invoice_id!, {
            invoice_number: prediction.invoiceNumber ?? undefined,
            amount: prediction.totalTtc ?? undefined,
            due_date: prediction.dueDate ?? undefined,
            status: "pending",
        });
    }

    setResponseStatus(event, 204);
    return;
});

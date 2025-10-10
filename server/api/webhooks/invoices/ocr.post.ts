import { serverServiceRole } from "~~/shared/providers/database/supabase/client";
import { OcrProviderName } from "~~/types/providers/ocr/mindee/types";
import { getOcrProvider } from "~~/server/lib/providers/ocr/factory";
import createInvoiceRepository from "~~/shared/providers/database/supabase/repositories/invoice.repository";
import createInvoiceTaskRepository from "#shared/repositories/tasks/invoice_task.repository";

export default defineEventHandler(async (event) => {
    const providerName = (getQuery(event).provider as OcrProviderName) ??
        "mindee";
    const provider = getOcrProvider(providerName);
    const supabaseServiceRole = serverServiceRole(event);
    const invoiceRepository = createInvoiceRepository(supabaseServiceRole);
    const invoiceTaskRepository = createInvoiceTaskRepository(
        supabaseServiceRole,
    );

    const { isValid, jobId, prediction, raw } = await provider.parseWebhook(
        event,
    );

    if (!isValid) {
        if (!jobId) {
            throw createError({ status: 400, message: "Invalid jobId" });
        } else {
            await invoiceTaskRepository.updateInvoiceTask(jobId, {
                status: "error",
            }, "job_id");
            throw createError({ status: 400, message: "Invalid webhook" });
        }
    }

    console.log("OCR Webhook received for jobId:", jobId);
    if (jobId && prediction) {
        console.log("predictions: ", prediction);
        const { data: jobData, error: jobError } = await invoiceTaskRepository
            .updateInvoiceTask(jobId, {
                status: "done",
                raw_result: typeof raw === "object" ? JSON.stringify(raw) : raw,
            });
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

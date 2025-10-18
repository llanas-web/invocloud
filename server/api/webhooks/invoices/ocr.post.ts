import { buildRequestScope } from "~~/server/core/container";
import { OcrProviderName } from "~~/shared/types/providers/ocr/types";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            ocr,
            repos: {
                invoiceTaskRepository,
                invoiceRepository,
            },
        },
    } = await buildRequestScope(event);

    const { isValid, jobId, prediction, raw } = await ocr.parseWebhook(
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

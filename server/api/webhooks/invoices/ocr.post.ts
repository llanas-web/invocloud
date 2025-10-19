import { buildRequestScope } from "~~/server/core/container";
import { OcrProviderName } from "~~/shared/types/providers/ocr/types";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            ocr,
            database: {
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
        const updatedTask = await invoiceTaskRepository
            .updateInvoiceTask(jobId, {
                status: "done",
                raw_result: typeof raw === "object" ? JSON.stringify(raw) : raw,
            });

        await invoiceRepository.updateInvoice(updatedTask.invoiceId, {
            invoice_number: prediction.invoiceNumber ?? undefined,
            amount: prediction.totalTtc ?? undefined,
            due_date: prediction.dueDate ?? undefined,
            status: "pending",
        });
    }
});

import { buildRequestScope } from "~~/server/core/container";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import { InvoiceTaskStatus } from "~~/shared/types/models/invoice-task.model";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            ocr,
            storage,
            database: { invoiceTaskRepository },
        },
    } = await buildRequestScope(event);

    // SECURITY CHECK
    const cron_token = event.headers.get("authorization") || "";
    console.log("OCR Runner cron_token:", cron_token ? "provided" : "missing");
    console.log(
        "Expected CRON_SECRET:",
        process.env.CRON_SECRET ? "set" : "missing",
    );
    if (cron_token !== `Bearer ${process.env.CRON_SECRET}`) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    // GET THE JOBS
    const invoiceTasks = await invoiceTaskRepository.getInvoiceTasks(
        InvoiceTaskStatus.QUEUED,
    );

    const processJob = async (
        jobId: string,
        filePath: string,
        attempts: number,
    ) => {
        const result = await ocr.submitUrl(filePath, {
            invoiceId: jobId,
        });
        if (!result.jobId) {
            console.error(`Failed to submit job for invoice ${jobId}`);
            return;
        }
        await invoiceTaskRepository
            .updateInvoiceTask(jobId, {
                status: InvoiceTaskStatus.SUBMITTED,
                job_id: result.jobId,
                attempts: attempts + 1,
            });
        console.log(
            `Job ${jobId} submitted successfully.`,
        );
    };

    await Promise.all(
        invoiceTasks.map(
            async (job, index) => {
                if (!job.invoicePath) {
                    console.error(
                        `Job ${job.id} has no associated invoice file path.`,
                    );
                    return Promise.resolve();
                }
                const signedUrl = await storage.createSignedUrl(
                    STORAGE_BUCKETS.INVOICES,
                    job.invoicePath,
                    60,
                );
                return processJob(
                    job.id,
                    signedUrl,
                    job.attempts,
                );
            },
        ),
    );
});

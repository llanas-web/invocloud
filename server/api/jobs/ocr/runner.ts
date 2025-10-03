import { getOcrProvider } from "~~/server/lib/ocr/factory";
import { serverServiceRole } from "~~/server/lib/supabase/client";
import createStorageRepository from "#shared/repositories/storage.repository";

export default defineEventHandler(async (event) => {
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

    // INIT
    const ocrProvider = getOcrProvider("mindee");
    const supabaseAdmin = serverServiceRole(event);
    const storageRepository = createStorageRepository(supabaseAdmin);

    // GET THE JOBS
    const { data: jobs, error } = await supabaseAdmin
        .from("invoice_jobs")
        .select(`*, invoice:invoices(id, file_path)`)
        .eq("status", "queued")
        .lt("attempts", 5)
        .order("created_at", { ascending: true })
        .limit(25);

    console.log("Fetched OCR jobs:", jobs);

    if (error) {
        console.error("Error fetching OCR jobs:", error);
        throw createError({ status: 500, message: "Error fetching OCR jobs" });
    }
    if (!jobs || jobs.length === 0) {
        console.log("No OCR jobs to process.");
        return { success: true, message: "No OCR jobs to process." };
    }

    const processJob = async (
        jobId: string,
        filePath: string,
        attempts: number,
    ) => {
        const result = await ocrProvider.submitUrl(filePath, {
            invoiceId: jobId,
        });
        if (!result.jobId) {
            console.error(`Failed to submit job for invoice ${jobId}`);
            return;
        }
        const { error: updateError } = await supabaseAdmin
            .from("invoice_jobs")
            .update({
                status: "submitted",
                job_id: result.jobId,
                attempts: attempts + 1,
            })
            .eq("id", jobId);
        if (updateError) {
            console.error(`Error updating job ${jobId}:`, updateError);
        }
        console.log(
            `Job ${jobId} submitted successfully.`,
        );
    };

    // Getting the signedUrl
    const { data: signedUrls, error: signedUrlError } = await storageRepository
        .createSignedUrls(
            jobs.map((job) => job.invoice!.file_path),
            60,
        );
    if (signedUrlError) {
        console.error("Error creating signed URLs:", signedUrlError);
        throw createError({
            status: 500,
            message: "Error creating signed URLs",
        });
    }

    await Promise.all(
        jobs.map(async (job, index) => {
            if (!job.invoice?.file_path) {
                console.error(
                    `Job ${job.id} has no associated invoice file path.`,
                );
                return Promise.resolve(); // Skip this job
            }
            return processJob(
                job.id,
                signedUrls[index].signedUrl,
                job.attempts,
            );
        }),
    );
    return { success: true };
});

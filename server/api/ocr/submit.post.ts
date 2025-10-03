import { defineEventHandler } from "h3";
import { serverServiceRole } from "~~/server/lib/supabase/client";
import { parseBody } from "~~/server/lib/common";
import { z } from "zod";
import { getOcrProvider } from "~~/server/lib/ocr/factory";
import { OcrProviderName } from "~~/server/lib/ocr/types";
import createInvoiceRepository from "#shared/repositories/invoice.repository";
import createStorageRepository from "#shared/repositories/storage.repository";

const schema = z.object({
    id: z.string().uuid(),
    invoiceId: z.string().uuid(),
    provider: z.enum(["mindee"]).default("mindee"),
});

export default defineEventHandler(async (event) => {
    const { id, invoiceId, provider } = await parseBody(
        event,
        schema,
    );

    const config = useRuntimeConfig();
    const providerName = provider ??
        (config.ocr?.provider as OcrProviderName ?? "mindee");
    const ocrProvider = getOcrProvider(providerName);

    // Genearte signed URL for upload
    const supabaseServiceRole = serverServiceRole(event);
    const invoiceRepository = createInvoiceRepository(supabaseServiceRole);
    const storageRepository = createStorageRepository(supabaseServiceRole);
    const { data: invoices, error: invoiceError } = await invoiceRepository
        .getInvoicesByIds([invoiceId]);
    if (invoiceError || !invoices || invoices.length === 0) {
        throw createError({ status: 404, message: "Invoice not found" });
    }
    const invoice = invoices[0]!;
    const { data: signedUrls, error: signedUrlError } = await storageRepository
        .createSignedUrls([invoice.file_path], 60);

    if (signedUrlError || !signedUrls || signedUrls.length === 0) {
        throw createError({ status: 404, message: "Invoice not found" });
    }

    const { jobId } = await ocrProvider.submitUrl(signedUrls[0].signedUrl, {
        invoiceId: invoiceId,
    });

    if (!jobId) {
        throw createError({
            status: 500,
            message: "Failed to process the document",
        });
    }
    console.log("Inference ID:", jobId);

    const { data: invoiceJob, error: invoiceJobError } =
        await supabaseServiceRole
            .from("invoice_jobs")
            .update({
                job_id: jobId,
            }).eq("id", id)
            .select()
            .single();

    if (invoiceJobError || !invoiceJob) {
        console.error("Error creating invoice job:", invoiceJobError);
        throw createError({
            status: 500,
            message: "Failed to create invoice job",
        });
    }
    console.log("Created invoice job:", invoiceJob.id);
    await invoiceRepository.updateInvoice(invoiceId, {
        status: "ocr",
    });

    return { jobId: invoiceJob.id };
});

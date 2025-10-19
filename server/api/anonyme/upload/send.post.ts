import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

const schema = z.object({
    uploadValidationId: z.uuid(),
    selectedEstablishmentId: z.uuid(),
    comment: z.string().optional(),
    fileName: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            storage,
            database: { uploadValidationRepository, invoiceRepository },
        },
    } = await buildRequestScope(event);

    const { uploadValidationId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            schema,
        );

    const filePath = `${selectedEstablishmentId}/${uploadValidationId}`;

    await invoiceRepository.createInvoice({
        id: uploadValidationId,
        file_path: filePath,
        supplier_id: selectedEstablishmentId,
        comment,
        name: fileName,
    });

    await uploadValidationRepository.updateUploadValidation(
        uploadValidationId,
        {
            status: "uploaded",
        },
    );

    const signedUrl = await storage.createSignedUploadUrl(
        STORAGE_BUCKETS.INVOICES,
        filePath,
    );

    return signedUrl;
});

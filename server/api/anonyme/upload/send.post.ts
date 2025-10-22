import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { SendUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/send.contract";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            storage,
            database: { uploadValidationRepository },
        },
    } = await buildRequestScope(event);
    const { usecases } = { usecases: useServerUsecases(event) };

    const { uploadValidationId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            SendUploadInvoiceRequestSchema,
        );

    const filePath = `${selectedEstablishmentId}/${uploadValidationId}`;

    await usecases.invoices.create.execute({
        filePath,
        supplierId: selectedEstablishmentId,
        comment,
        name: fileName,
        source: "upload",
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

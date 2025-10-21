import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { useServerUsecases } from "~~/server/plugins/usecases.server";
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
            database: { uploadValidationRepository },
        },
    } = await buildRequestScope(event);
    const { usecases } = { usecases: useServerUsecases(event) };

    const { uploadValidationId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            schema,
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

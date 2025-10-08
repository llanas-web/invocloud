import { z } from "zod";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";
import createStorageRepository from "#shared/repositories/storage.repository";
import createUploadRepository from "#shared/repositories/upload.repository";

const schema = z.object({
    invoiceId: z.string().uuid(),
    selectedEstablishmentId: z.string().uuid(),
    comment: z.string().optional(),
    fileName: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { invoiceId, selectedEstablishmentId } = await parseBody(
        event,
        schema,
    );

    const supabase = serverServiceRole(event);
    const storageRepository = createStorageRepository(supabase);
    const uploadRepository = createUploadRepository(supabase);
    const user = await serverUser(event);
    if (!user) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }
    console.log("Authenticated user:", user.id);

    const filePath = `${selectedEstablishmentId}/${invoiceId}`;
    const { data: uploadUrl } = await storageRepository.createSignedUploadUrl(
        filePath,
    );

    if (!uploadUrl) {
        throw createError({
            status: 500,
            message: "Erreur lors de la création de l'URL signée",
        });
    }

    const { data: uploadValidation, error: uploadValidationError } =
        await uploadRepository.validateUpload(
            invoiceId,
            user.id,
            {
                status: "uploaded",
                selected_establishment: selectedEstablishmentId,
                file_path: filePath,
            },
        );
    if (uploadValidationError || !uploadValidation) {
        throw createError({
            status: 500,
            message:
                "Erreur lors de la mise à jour de la validation de téléchargement",
        });
    }

    return { success: true, url: uploadUrl.signedUrl };
});

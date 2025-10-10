import z from "zod";
import { hashCode } from "~/utils/hash";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";
import createEstablishmentRepository from "~~/shared/providers/database/supabase/repositories/establishment.repository";
import createUploadRepository from "~~/shared/providers/database/supabase/repositories/upload-validation.repository";

const schema = z.object({
    uploadValidationId: z.string().uuid(),
    token: z.string().min(6).max(6),
});

export default defineEventHandler(async (event) => {
    const { uploadValidationId, token } = await parseBody(
        event,
        schema,
    );

    const supabase = serverServiceRole(event);
    const establishmentRepository = createEstablishmentRepository(supabase);
    const uploadRepository = createUploadRepository(supabase);
    const supabaseUser = await serverUser(event);
    if (!supabaseUser) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }

    const hashedCode = hashCode(token);

    const { data: uploadValidation, error: uploadValidationError } =
        await uploadRepository.isTokenValid(
            uploadValidationId,
            supabaseUser.id,
            hashedCode,
        );

    if (uploadValidationError || !uploadValidation) {
        throw createError({
            status: 404,
            message: uploadValidationError?.message ||
                "Fichier introuvable ou token expiré",
        });
    }

    const { data: possibleEstablishments, error: establishmentsError } =
        await establishmentRepository.getEstablishmentsByIds(
            uploadValidation.establishments,
        );

    if (establishmentsError || !possibleEstablishments) {
        throw createError({
            status: 404,
            message: establishmentsError?.message ||
                "Établissements non trouvés",
        });
    }

    return {
        uploadValidation,
        establishments: possibleEstablishments,
    };
});

import { z } from "zod";
import { hashCode } from "~/utils/hash";
import { parseBody } from "~~/server/lib/common";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";

const schema = z.object({
    uploadValidationId: z.string().uuid(),
    token: z.string().min(6).max(6),
});

export default defineEventHandler(async (event) => {
    const { uploadValidationId, token } = await parseBody(event, schema);

    const supabase = serverServiceRole(event);
    const supabaseUser = await serverUser(event);
    if (!supabaseUser) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }

    const hashedCode = hashCode(token);

    const { data: uploadValidation, error: uploadValidationError } =
        await supabase
            .from("upload_validations")
            .select("*")
            .eq("id", uploadValidationId)
            .eq("uploader_id", supabaseUser.id)
            .eq("token_hash", hashedCode)
            .maybeSingle();

    if (uploadValidationError || !uploadValidation) {
        throw createError({
            status: 404,
            message: uploadValidationError?.message ||
                "Fichier introuvable ou token expiré",
        });
    }

    const { data: possibleEstablishments, error: establishmentsError } =
        await supabase
            .from("establishments")
            .select("id, name")
            .in("id", uploadValidation.establishments);

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

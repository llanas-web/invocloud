import {
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import { hashCode } from "~/utils/hash";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { uploadValidationId, token } = body;

    if (!uploadValidationId || !token) {
        throw createError({
            status: 400,
            message: "Données de requête invalides",
        });
    }

    const supabase = serverSupabaseServiceRole(event);
    const supabaseUser = await serverSupabaseUser(event);
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

import {
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { uploadValidationId, selectedEstablishmentId } = body;

    if (!uploadValidationId || !selectedEstablishmentId) {
        throw createError({
            status: 400,
            message: "Missing upload validation ID or selected establishment",
        });
    }

    const supabase = serverSupabaseServiceRole(event);
    const supabaseUser = await serverSupabaseUser(event);
    if (!supabaseUser) {
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const { data: uploadValidation, error: uploadValidationError } =
        await supabase
            .from("upload_validations")
            .select("*")
            .eq("id", uploadValidationId)
            .eq("uploader_id", supabaseUser.id)
            .maybeSingle();
    if (!uploadValidation) {
        throw createError({
            status: 404,
            message: "Upload validation not found",
        });
    }

    const { data: uploadUrl } = await supabase
        .storage
        .from("pending-invoices")
        .createSignedUploadUrl(
            uploadValidation.file_path,
        );

    if (!uploadUrl) {
        throw createError({
            status: 500,
            message: "Error creating signed URL",
        });
    }

    await supabase.from("upload_validations").update({
        status: "uploaded",
        selected_establishment: selectedEstablishmentId,
    }).eq("id", uploadValidationId);

    const response = {
        url: uploadUrl.signedUrl,
        toJSON() {
            return {
                url: this.url,
            };
        },
    };
    return response;
});

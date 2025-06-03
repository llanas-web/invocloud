import { serverSupabaseServiceRole } from "#supabase/server";
import { hashCode } from "~/utils/hash";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { uploadValidationId, token } = body;

    if (!uploadValidationId || !token) {
        throw createError({
            status: 400,
            message: "Missing upload validation ID or token",
        });
    }

    const supabase = serverSupabaseServiceRole(event);

    const hashedCode = hashCode(token);

    const { data: uploadValidation } = await supabase
        .from("upload_validations")
        .select(`
            id,
            filePath:file_path,
            supplier:suppliers (
                id,
                establishment:establishments (
                    id,
                    name
                )
            )
        `)
        .eq("id", uploadValidationId)
        .eq("token_hash", hashedCode)
        .maybeSingle();

    if (!uploadValidation) {
        throw createError({
            status: 404,
            message: "File not found or token expired",
        });
    }

    const { data: uploadUrl } = await supabase
        .storage
        .from("invoices")
        .createSignedUploadUrl(
            uploadValidation.filePath,
        );

    if (!uploadUrl) {
        throw createError({
            status: 500,
            message: "Error creating signed URL",
        });
    }

    await supabase.from("upload_validations").update({
        status: "uploaded",
    }).eq("id", uploadValidationId);

    const response = {
        url: uploadUrl.signedUrl,
        fileName: uploadValidation.id,
        toJSON() {
            return {
                url: this.url,
                fileName: this.fileName,
            };
        },
    };
    return response;
});

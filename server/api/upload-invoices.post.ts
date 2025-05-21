import { serverSupabaseServiceRole } from "#supabase/server";
import { hashCode } from "~/utils/hash";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { invoiceId, token } = body;

    if (!invoiceId || !token) {
        throw createError({
            status: 400,
            message: "Missing invoice ID or token",
        });
    }

    const supabase = serverSupabaseServiceRole(event);

    const hashedCode = hashCode(token);
    console.log("Hashed code:", hashedCode);

    const { data: file } = await supabase
        .from("shared_invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("token", hashedCode)
        .maybeSingle();

    if (!file) {
        throw createError({
            status: 404,
            message: "File not found or token expired",
        });
    }

    const { data } = await supabase
        .storage
        .from("shared-invoices")
        .createSignedUploadUrl(`${file.user_id}/${file.id}`);

    if (!data) {
        throw createError({
            status: 500,
            message: "Error creating signed URL",
        });
    }

    const response = {
        url: data.signedUrl,
        fileName: file.id,
        toJSON() {
            return {
                url: this.url,
                fileName: this.fileName,
            };
        },
    };
    return response;
});

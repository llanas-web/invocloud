import type { SupabaseClient } from "@supabase/supabase-js";
import type { UploadValidationInsert, UploadValidationUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";
import { generateCode, hashCode } from "~/utils/hash";

const createUploadRepository = (
    supabase: SupabaseClient<Database>,
) => {
    const createUploadValidation = async (
        invoiceId: string,
        userId: string,
        token: string,
        suppliersId: string[],
        establishementsId: string[],
        recipientEmail: string,
        fileName: string,
        comment?: string,
    ) => {
        const hashedCode = hashCode(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
        const response = await supabase
            .from("upload_validations")
            .insert({
                id: invoiceId,
                uploader_id: userId,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toUTCString(),
                suppliers: suppliersId,
                establishments: establishementsId,
                recipient_email: recipientEmail,
                file_name: fileName,
                comment,
            })
            .select()
            .single();

        if (response.error) {
            console.error("Error creating upload validation:", response.error);
        }

        return response;
    };

    const isTokenValid = async (
        id: string,
        uploaderId: string,
        token: string,
    ) => {
        const hashedCode = hashCode(token);
        const response = await supabase
            .from("upload_validations")
            .select()
            .eq("id", id)
            .eq("uploader_id", uploaderId)
            .eq("token_hash", hashedCode)
            .lt("token_expires_at", new Date().toISOString())
            .single();

        if (response.error) {
            console.error("Error validating upload token:", response.error);
        }

        return response;
    };

    const validateUpload = async (
        invoiceId: string,
        userId: string,
        uploadValidation: UploadValidationUpdate,
    ) => {
        const response = await supabase
            .from("upload_validations")
            .update(uploadValidation)
            .eq("id", invoiceId)
            .eq("uploader_id", userId);
        if (response.error) {
            console.error("Error validating upload:", response.error);
        }
        return response;
    };

    return {
        createUploadValidation,
        isTokenValid,
        validateUpload,
    };
};

export default createUploadRepository;

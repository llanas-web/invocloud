import type { SupabaseClient } from "@supabase/supabase-js";
import type { UploadValidationUpdate } from "~~/types/providers/database/index";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import { hashCode } from "~/utils/hash";
import type { UploadValidationRepository } from "../../database.interface";
import SupabaseError from "../supabase-error";

export class UploadValidationSupabaseRepository
    implements UploadValidationRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async createUploadValidation(
        senderEmail: string,
        recipientEmail: string,
        token: string,
        uploaderId?: string,
    ) {
        const hashedCode = hashCode(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
        const { data: user, error: userError } = await this.supabase.auth
            .getUser();
        if (userError) {
            throw new SupabaseError(
                "Error fetching user for upload:",
                userError,
            );
        }

        const { data, error } = await this.supabase
            .from("upload_validations")
            .insert({
                sender_email: senderEmail,
                recipient_email: recipientEmail,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toUTCString(),
                uploader_id: uploaderId || user.user.id,
            })
            .select("id")
            .single();
        if (error) {
            throw new SupabaseError("Error creating upload validation:", error);
        }
        return data.id;
    }
    async isTokenValid(
        uploadValidationId: string,
        uploaderId: string,
        token: string,
    ) {
        const hashedCode = hashCode(token);
        const { data, error } = await this.supabase
            .from("upload_validations")
            .select("id")
            .eq("id", uploadValidationId)
            .eq("uploader_id", uploaderId)
            .eq("token_hash", hashedCode)
            .gt("token_expires_at", new Date().toISOString())
            .single();
        if (error) {
            throw new SupabaseError("Error validating upload token:", error);
        }
        return !!data;
    }

    async updateUploadValidation(
        uploadValidationId: string,
        updates: UploadValidationUpdate,
    ) {
        const { error } = await this.supabase
            .from("upload_validations")
            .update(updates)
            .eq("id", uploadValidationId);
        if (error) {
            throw new SupabaseError("Error updating upload validation:", error);
        }
        return true;
    }
}

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

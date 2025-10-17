import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { hashCode } from "~/utils/hash";
import type { UploadValidationRepository } from "../../database.interface";
import { SupabaseError } from "../supabase-error";
import type {
    UploadValidationUpdate,
} from "~~/shared/types/providers/database";

export class UploadValidationSupabaseRepository
    implements UploadValidationRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getUploadValidation(
        uploadValidation: string,
        hashToken: string,
        uploaderId: string,
    ) {
        const { data, error } = await this.supabase.from("upload_validations")
            .select("*")
            .eq("id", uploadValidation).eq("hash_token", hashToken).eq(
                "uploader_id",
                uploaderId,
            ).single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data;
    }

    async createUploadValidation(
        senderEmail: string,
        recipientEmail: string,
        token: string,
        uploaderId?: string,
        establishementsIds?: string[],
    ) {
        const hashedCode = hashCode(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

        const { data, error } = await this.supabase
            .from("upload_validations")
            .insert({
                sender_email: senderEmail,
                recipient_email: recipientEmail,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toUTCString(),
                uploader_id: uploaderId,
                establishments: establishementsIds,
            })
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
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
        if (error) throw SupabaseError.fromPostgrest(error);
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
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UploadValidationUpdate } from "~~/types/providers/database/index";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import { hashCode } from "~/utils/hash";
import type { UploadValidationRepository } from "../../database.interface";
import { Err, Ok } from "../../result";
import { SupabaseError } from "../supabase-error";

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

        const { data, error } = await this.supabase
            .from("upload_validations")
            .insert({
                sender_email: senderEmail,
                recipient_email: recipientEmail,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toUTCString(),
                uploader_id: uploaderId,
            })
            .select("id")
            .single();
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(data.id);
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
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(!!data);
    }

    async updateUploadValidation(
        uploadValidationId: string,
        updates: UploadValidationUpdate,
    ) {
        const { error } = await this.supabase
            .from("upload_validations")
            .update(updates)
            .eq("id", uploadValidationId);
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(true);
    }
}

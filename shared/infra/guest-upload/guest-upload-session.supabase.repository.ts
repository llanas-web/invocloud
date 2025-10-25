import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import GuestUploadSessionModel from "~~/shared/domain/guest-upload/guest-upload-session.model";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";

export class GuestUploadSessionSupabaseRepository
    implements GuestUploadSessionRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async save(session: GuestUploadSessionModel): Promise<void> {
        const props = session.toPersistence();

        const { error } = await this.supabase
            .from("guest_upload_sessions")
            .upsert({
                id: props.id,
                sender_email: props.senderEmail,
                verification_token_hash: props.verificationTokenHash,
                expires_at: props.expiresAt.toISOString(),
                verified_at: props.verifiedAt?.toISOString() ?? null,
                created_at: props.createdAt.toISOString(),
            });

        if (error) {
            throw new Error(
                `Failed to save guest upload session: ${error.message}`,
            );
        }
    }

    async findById(id: string): Promise<GuestUploadSessionModel | null> {
        const { data, error } = await this.supabase
            .from("guest_upload_sessions")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        return GuestUploadSessionModel.fromPersistence({
            id: data.id,
            senderEmail: data.sender_email,
            verificationTokenHash: data.verification_token_hash,
            expiresAt: new Date(data.expires_at),
            verifiedAt: data.verified_at ? new Date(data.verified_at) : null,
            createdAt: new Date(data.created_at),
        });
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("guest_upload_sessions")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(
                `Failed to delete guest upload session: ${error.message}`,
            );
        }
    }
}

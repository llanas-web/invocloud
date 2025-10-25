import type { StorageRepository } from "~~/shared/application/common/providers/storage/storage.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import StorageError from "~~/shared/application/common/providers/storage/storage.error";
import type { Database } from "./database.types";

class StorageSupabaseRepository implements StorageRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async uploadFile(
        bucket: string,
        path: string,
        file: File,
        options: { contentType: string; upsert: boolean },
    ): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, file, {
                contentType: options.contentType,
                upsert: options.upsert,
            });
        if (error) {
            throw new StorageError("Error uploading file", error);
        }
        return data.path;
    }

    async deleteFile(bucket: string, filePath: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([filePath]);
        if (error) {
            throw new StorageError("Error deleting file", error);
        }
    }

    async downloadFile(bucket: string, filePath: string): Promise<Blob> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .download(filePath);
        if (error) {
            throw new StorageError("Error downloading file", error);
        }
        return data;
    }

    async createSignedUploadUrl(
        bucket: string,
        filePath: string,
    ): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUploadUrl(filePath);
        if (error) {
            throw new StorageError("Error creating signed upload URL", error);
        }
        return data.signedUrl;
    }

    async createSignedUrl(
        bucket: string,
        filePath: string,
        expiresIn: number,
    ): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);
        if (error) {
            throw new StorageError("Error creating signed URL", error);
        }
        return data.signedUrl;
    }

    async createSignedUrls(
        bucket: string,
        filePaths: string[],
        expiresIn: number,
    ): Promise<string[]> {
        const { data, error } = await this.supabase.storage.from(bucket)
            .createSignedUrls(
                filePaths,
                expiresIn,
            );
        if (error) throw new StorageError("Error creating signed URLs", error);
        return data.map((item) => item.signedUrl);
    }
}

export default StorageSupabaseRepository;

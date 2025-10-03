import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/types/database.types";

const createStorageRepository = (supabase: SupabaseClient<Database>) => {
    const uploadInvoiceFile = async (
        file: File,
        path: string,
        options: { contentType?: string; upsert?: boolean } = {},
    ) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .upload(path, file, options);
        if (error) {
            console.error("Error uploading file:", error);
        }
        return { data, error };
    };

    const removeInvoiceFile = async (path: string) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .remove([path]);
        if (error) {
            console.error("Error removing file:", error);
        }
        return { data, error };
    };

    const createSignedUploadUrl = async (
        path: string,
    ) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .createSignedUploadUrl(path);
        if (error) {
            console.error("Error creating signed upload URL:", error);
        }
        return { data, error };
    };

    const createSignedUrl = async (path: string, expiresIn: number = 60) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .createSignedUrl(path, expiresIn);
        if (error) {
            console.error("Error creating signed URL:", error);
        }
        return { data, error };
    };

    const createSignedUrls = async (
        paths: string[],
        expiresIn: number = 60,
    ) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .createSignedUrls(paths, expiresIn);
        if (error || !data || data.length !== paths.length) {
            console.error("Error creating signed URLs:", error);
        }
        return { data: data as { signedUrl: string }[], error };
    };

    const downloadInvoiceFile = async (path: string) => {
        const { data, error } = await supabase.storage
            .from("invoices")
            .download(path);

        if (error || !data) {
            console.error("Error downloading invoice file:", error);
        }
        return { data: data as Blob, error };
    };

    return {
        uploadInvoiceFile,
        removeInvoiceFile,
        createSignedUrl,
        createSignedUrls,
        createSignedUploadUrl,
        downloadInvoiceFile,
    };
};

export default createStorageRepository;

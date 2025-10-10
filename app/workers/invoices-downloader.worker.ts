/// <reference lib="webworker" />
// app/workers/invoices-downloader.worker.ts
import { BlobReader, BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Invoice } from "~~/types";
import * as mime from "mime-types";
import createStorageRepository from "~~/shared/providers/database/supabase/repositories/storage.repository";
// if you ever need supabase-js in worker, you can import it here and initialize with the passed keys.

type DownloadMsg = {
    type: "download";
    invoices: Partial<Invoice>[];
    supabaseUrl: string;
    supabaseAnonKey: string;
    access_token: string;
    refresh_token: string;
};

self.onmessage = async (e: MessageEvent<string>) => {
    const data = JSON.parse(e.data) as DownloadMsg;
    if (!data || data.type !== "download") return;

    const { invoices, supabaseUrl, supabaseAnonKey } = data;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
    const storageRepository = createStorageRepository(supabaseClient);
    const { data: { session }, error } = await supabaseClient.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
    });
    if (error) {
        (self as any).postMessage({ type: "done", blob: null });
        return;
    }

    const writer = new BlobWriter("application/zip");
    const zip = new ZipWriter(writer);

    let done = 0;
    const total = invoices.length;
    const concurrency = Math.min(4, total);

    const work = async (start: number, step: number) => {
        for (let i = start; i < total; i += step) {
            const invoice = invoices[i];
            if (!invoice) {
                done++;
                (self as any).postMessage({ type: "progress", done, total });
                continue;
            }
            try {
                const { data: blob, error } = await storageRepository
                    .downloadInvoiceFile(invoice.file_path!);
                if (error) throw error;
                await zip.add(
                    `${invoice.invoice_number}.${
                        mime.extension(
                            blob.type,
                        ) || "bin"
                    }`,
                    new BlobReader(blob),
                );
            } catch (e: any) {
                await zip.add(
                    `${invoice.invoice_number}-ERROR.txt`,
                    new TextReader(String(e?.message ?? "error")),
                );
            } finally {
                done++;
                (self as any).postMessage({ type: "progress", done, total });
            }
        }
    };

    await Promise.all(
        Array.from({ length: concurrency }, (_, k) => work(k, concurrency)),
    );
    const zipBlob = await zip.close();
    (self as any).postMessage({
        type: "done",
        blob: zipBlob,
    });
};

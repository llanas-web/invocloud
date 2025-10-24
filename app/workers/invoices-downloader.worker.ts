/// <reference lib="webworker" />
// app/workers/invoices-downloader.worker.ts
import { BlobReader, BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
import { createClient } from "@supabase/supabase-js";
import * as mime from "mime-types";
import StorageFactory from "~~/shared/providers/storage/storage.factory";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
// if you ever need supabase-js in worker, you can import it here and initialize with the passed keys.

type DownloadMsg = {
    type: "download";
    invoices: Partial<InvoiceModel>[];
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
    const storageRepository = StorageFactory.getInstance(supabaseClient);
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
                const blob = await storageRepository
                    .downloadFile(STORAGE_BUCKETS.INVOICES, invoice.filePath!);
                if (error) throw error;
                await zip.add(
                    `${invoice.invoiceNumber}.${
                        mime.extension(
                            blob.type,
                        ) || "bin"
                    }`,
                    new BlobReader(blob),
                );
            } catch (e: any) {
                await zip.add(
                    `${invoice.invoiceNumber}-ERROR.txt`,
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

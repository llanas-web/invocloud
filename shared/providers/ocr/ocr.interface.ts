import type {
    OcrSubmitOptions,
    OcrSubmitResult,
    OcrWebhookPayload,
} from "~~/shared/types/providers/ocr/types";

export interface OcrProvider {
    /** Envoi d’un fichier binaire */
    submitBuffer(
        input: Uint8Array,
        filename: string,
        opts: OcrSubmitOptions,
    ): Promise<OcrSubmitResult>;

    /** Envoi par URL (ex: Signed URL Supabase) */
    submitUrl(url: string, opts: OcrSubmitOptions): Promise<OcrSubmitResult>;

    /** Vérifie la signature + mappe la charge utile du webhook en format commun */
    parseWebhook(event: any): Promise<OcrWebhookPayload>;
}

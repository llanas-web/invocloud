import type {
    OcrSubmitDTO,
    OcrSubmitResultDTO,
    OcrWebhookPayloadDTO,
} from "./dto/ocr.dto";

export interface OcrRepository {
    /** Envoi d’un fichier binaire */
    submitBuffer(
        input: Uint8Array,
        filename: string,
        opts: OcrSubmitDTO,
    ): Promise<OcrSubmitResultDTO>;

    /** Envoi par URL (ex: Signed URL Supabase) */
    submitUrl(url: string, opts: OcrSubmitDTO): Promise<OcrSubmitResultDTO>;

    /** Vérifie la signature + mappe la charge utile du webhook en format commun */
    parseWebhook(event: any): Promise<OcrWebhookPayloadDTO>;
}

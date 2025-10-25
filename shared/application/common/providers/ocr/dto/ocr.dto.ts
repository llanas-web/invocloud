export type OcrSubmitDTO = {
    invoiceId: string;
};

export type OcrPredictionDTO = {
    invoiceNumber?: string | null;
    totalTtc?: number | null;
    currency?: string | null;
    dueDate?: string | null; // ISO
    providerRaw?: unknown; // JSON brut pour debug/audit
};

export type OcrSubmitResultDTO = {
    jobId: string;
};

export type OcrWebhookPayloadDTO = {
    /** Validité de la signature webhook */
    isValid: boolean;
    /** Id job côté provider (pour retrouver l’invoice/job chez toi) */
    jobId?: string;
    /** Prédiction normalisée */
    prediction?: OcrPredictionDTO;
    /** Corps brut (pour logs si nécessaire) */
    raw?: string | object;
};

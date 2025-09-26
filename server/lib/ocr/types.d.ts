export type OcrProviderName = "mindee" | "klippa" | "tesseract";

export type OcrSubmitOptions = {
    invoiceId: string;
};

export type OcrPrediction = {
    invoiceNumber?: string | null;
    totalTtc?: number | null;
    currency?: string | null;
    dueDate?: string | null; // ISO
    providerRaw?: unknown; // JSON brut pour debug/audit
};

export type OcrSubmitResult = {
    jobId: string;
};

export type OcrWebhookPayload = {
    /** Validité de la signature webhook */
    isValid: boolean;
    /** Id job côté provider (pour retrouver l’invoice/job chez toi) */
    jobId?: string;
    /** Prédiction normalisée */
    prediction?: OcrPrediction;
    /** Corps brut (pour logs si nécessaire) */
    raw?: string | object;
};

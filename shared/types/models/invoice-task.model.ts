import type { OcrProviderName } from "../providers/ocr/types";

export enum InvoiceTaskStatus {
    QUEUED = "queued",
    SUBMITTED = "submitted",
    DONE = "done",
    ERROR = "error",
}

export enum InvoiceTaskType {
    OCR = "ocr",
}

export class InvoiceTaskModel {
    id: string;
    status: InvoiceTaskStatus;
    attempts: number;
    created_at: string;
    type: InvoiceTaskType;
    provider: OcrProviderName;
    jobId: string | null;
    invoiceId: string;
    invoicePath?: string;

    constructor({
        id,
        jobId,
        invoiceId,
        status,
        attempts,
        created_at,
        type,
        provider,
        invoicePath,
    }: {
        id: string;
        invoiceId: string;
        status: InvoiceTaskStatus;
        attempts: number;
        created_at: string;
        type: InvoiceTaskType;
        provider: OcrProviderName;
        jobId: string | null;
        invoicePath?: string;
    }) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.status = status;
        this.attempts = attempts;
        this.created_at = created_at;
        this.type = type;
        this.provider = provider;
        this.jobId = jobId;
        this.invoicePath = invoicePath;
    }
}

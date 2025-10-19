import {
    InvoiceTaskModel,
    InvoiceTaskStatus,
    InvoiceTaskType,
} from "~~/shared/types/models/invoice-task.model";
import type { InvoiceTask } from "~~/shared/types/providers/database";
import type { OcrProviderName } from "~~/shared/types/providers/ocr/types";

export const invoiceTaskMapperFromDatabase = (
    dbRecord: InvoiceTask,
): InvoiceTaskModel => {
    return new InvoiceTaskModel({
        id: dbRecord.id,
        jobId: dbRecord.job_id,
        invoiceId: dbRecord.invoice_id,
        status: dbRecord.status as InvoiceTaskStatus,
        attempts: dbRecord.attempts,
        created_at: dbRecord.created_at,
        type: dbRecord.type as InvoiceTaskType,
        provider: dbRecord.provider as OcrProviderName,
    });
};

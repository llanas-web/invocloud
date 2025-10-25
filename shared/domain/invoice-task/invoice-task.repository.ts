import type {
    InvoiceTaskDraft,
    InvoiceTaskModel,
    InvoiceTaskStatus,
    InvoiceTaskType,
} from "./invoice-task.model";

export interface InvoiceTaskRepository {
    create(task: InvoiceTaskDraft): Promise<string>;

    findById(id: string): Promise<InvoiceTaskModel | null>;

    findByJobId(jobId: string): Promise<InvoiceTaskModel | null>;

    findByInvoiceId(invoiceId: string): Promise<InvoiceTaskModel[]>;

    findPendingTasks(options?: {
        status?: InvoiceTaskStatus;
        type?: InvoiceTaskType;
        maxAttempts?: number;
        limit?: number;
    }): Promise<InvoiceTaskModel[]>;

    update(task: InvoiceTaskModel): Promise<void>;
}

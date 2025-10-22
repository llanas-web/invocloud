import type {
    DraftInvoice,
    InvoiceModel,
} from "~~/shared/domain/invoice/invoice.model";

export interface InvoiceRepository {
    getById(id: string): Promise<InvoiceModel | null>;
    create(entity: DraftInvoice): Promise<string>;
    update(entity: InvoiceModel): Promise<void>;
    deleteMany(invoiceIds: string[]): Promise<void>;
}

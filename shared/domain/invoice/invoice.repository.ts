import type {
    DraftInvoice,
    InvoiceModel,
} from "~~/shared/domain/invoice/invoice.model";

export interface InvoiceRepository {
    getById(id: string): Promise<InvoiceModel | null>;
    create(entity: DraftInvoice): Promise<InvoiceModel>;
    update(entity: InvoiceModel): Promise<InvoiceModel>;
    deleteMany(invoiceIds: string[]): Promise<void>;
}

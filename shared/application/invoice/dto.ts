import type {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

export type InvoiceListItemDTO = {
    id: string;
    supplierId: string;
    supplierName: string;
    status: InvoiceStatus;
    source: InvoiceSource;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;

    // Champs optionnels
    name: string | null;
    number: string | null;
    amount: number | null;
    emitDate: Date | null;
    dueDate: Date | null;
    paidAt: Date | null;
    comment: string | null;
};

import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/types/models/invoice.model";
import type SupplierModel from "~~/shared/types/models/supplier.model";
import { fromStringToLocalDate } from "~~/shared/utils/date.utils";
import type { Invoice } from "~~/types/providers/database";

export const invoiceMapperFromDatabase = (
    invoice: Invoice,
    supplier: SupplierModel,
): InvoiceModel => {
    const invoiceStatus = invoice.status as InvoiceStatus;
    const invoiceSource = invoice.source as InvoiceSource;
    return new InvoiceModel({
        id: invoice.id,
        name: invoice.name,
        createdAt: fromStringToLocalDate(invoice.created_at),
        amount: invoice.amount,
        invoiceNumber: invoice.invoice_number,
        source: invoiceSource,
        status: invoiceStatus,
        updatedAt: fromStringToLocalDate(invoice.updated_at),
        paidAt: invoice.paid_at != null
            ? fromStringToLocalDate(invoice.paid_at)
            : null,
        dueDate: invoice.due_date != null
            ? fromStringToLocalDate(invoice.due_date)
            : null,
        filePath: invoice.file_path,
        comment: invoice.comment,
        supplier: supplier,
    });
};

import {
    InvoiceModel,
    type InvoiceModelInsert,
    type InvoiceModelUpdate,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/types/models/invoice.model";
import type SupplierModel from "~~/shared/types/models/supplier.model";
import { fromStringToLocalDate } from "~~/shared/utils/date.utils";
import type {
    Invoice,
    InvoiceInsert,
    InvoiceUpdate,
} from "~~/shared/types/providers/database";

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
        invoiceNumber: invoice.invoice_number ?? "",
        source: invoiceSource,
        status: invoiceStatus,
        updatedAt: fromStringToLocalDate(invoice.updated_at),
        paidAt: invoice.paid_at != null
            ? fromStringToLocalDate(invoice.paid_at)
            : null,
        dueDate: invoice.due_date != null
            ? fromStringToLocalDate(invoice.due_date)
            : new Date(),
        filePath: invoice.file_path,
        comment: invoice.comment,
        supplier: supplier,
    });
};

export const invoiceMapperForInsert = (
    invoiceToInsert: InvoiceModelInsert,
): InvoiceInsert => {
    return {
        id: invoiceToInsert.id,
        name: invoiceToInsert.name,
        amount: invoiceToInsert.amount,
        due_date: invoiceToInsert.dueDate
            ? invoiceToInsert.dueDate.toISOString()
            : null,
        paid_at: invoiceToInsert.paidAt
            ? invoiceToInsert.paidAt.toISOString()
            : null,
        file_path: invoiceToInsert.filePath,
        supplier_id: invoiceToInsert.supplierId,
    };
};

export const invoiceMapperForUpdate = (
    invoiceToUpdate: InvoiceModelUpdate,
): InvoiceUpdate => {
    return {
        name: invoiceToUpdate.name,
        amount: invoiceToUpdate.amount,
        due_date: invoiceToUpdate.dueDate
            ? invoiceToUpdate.dueDate.toISOString()
            : null,
        paid_at: invoiceToUpdate.paidAt
            ? invoiceToUpdate.paidAt.toISOString()
            : null,
    };
};

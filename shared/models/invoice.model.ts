import type SupplierModel from "./supplier.model";

export enum InvoiceSource {
    APP = "app",
    UPLOAD = "upload",
    EMAIL = "email",
}

export enum InvoiceStatus {
    OCR = "ocr",
    PENDING = "pending",
    SENT = "sent",
    VALIDATED = "validated",
    REJECTED = "rejected",
    PAID = "paid",
    ERROR = "error",
}

export class InvoiceModel {
    id: string;
    name?: string | null;
    createdAt: Date;
    amount: number;
    dueDate: Date | null;
    updatedAt: Date;
    filePath: string | null;
    invoiceNumber: string | null;
    source: InvoiceSource;
    status: InvoiceStatus;
    supplier: SupplierModel;

    constructor({
        id,
        name = null,
        createdAt,
        amount,
        dueDate = null,
        updatedAt,
        filePath = null,
        invoiceNumber = null,
        source,
        status,
        supplier,
    }: {
        id: string;
        name: string | null;
        createdAt: Date;
        amount: number;
        dueDate: Date | null;
        updatedAt: Date;
        filePath: string | null;
        invoiceNumber: string | null;
        source: InvoiceSource;
        status: InvoiceStatus;
        supplier: SupplierModel;
    }) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.amount = amount;
        this.dueDate = dueDate;
        this.updatedAt = updatedAt;
        this.filePath = filePath;
        this.invoiceNumber = invoiceNumber;
        this.source = source;
        this.status = status;
        this.supplier = supplier;
    }

    get isOverdue(): boolean {
        if (this.dueDate) {
            const today = new Date();
            return this.dueDate < today && this.status !== InvoiceStatus.PAID;
        }
        return false;
    }
}

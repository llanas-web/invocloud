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
    createdAt: Date;
    updatedAt: Date;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    filePath: string;
    source: InvoiceSource;
    status: InvoiceStatus;
    name: string | null;
    paidAt: Date | null;
    comment: string | null;
    supplier: SupplierModel;

    constructor({
        id,
        name = null,
        createdAt,
        amount,
        dueDate,
        updatedAt,
        paidAt = null,
        filePath,
        invoiceNumber,
        source = InvoiceSource.APP,
        status,
        comment = null,
        supplier,
    }: {
        id: string;
        createdAt: Date;
        amount: number;
        dueDate: Date;
        updatedAt: Date;
        filePath: string;
        invoiceNumber: string;
        source: InvoiceSource;
        status: InvoiceStatus;
        name: string | null;
        paidAt: Date | null;
        comment: string | null;
        supplier: SupplierModel;
    }) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.amount = amount;
        this.dueDate = dueDate;
        this.updatedAt = updatedAt;
        this.paidAt = paidAt;
        this.filePath = filePath;
        this.invoiceNumber = invoiceNumber;
        this.source = source;
        this.status = status;
        this.comment = comment;
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

export type InvoiceModelUpdate = Partial<
    Omit<InvoiceModel, "id" | "createdAt" | "updatedAt" | "supplier">
>;

export type InvoiceModelInsert =
    & Omit<
        InvoiceModel,
        "id" | "createdAt" | "updatedAt" | "supplier" | "isOverdue" | "source"
    >
    & { id?: string; supplierId: string };

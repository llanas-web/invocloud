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
    paidAt: Date | null;
    filePath: string | null;
    invoiceNumber: string | null;
    source: InvoiceSource;
    status: InvoiceStatus;
    comment: string | null;
    supplier: SupplierModel;

    constructor({
        id,
        name = null,
        createdAt,
        amount,
        dueDate = null,
        updatedAt,
        paidAt = null,
        filePath = null,
        invoiceNumber = null,
        source = InvoiceSource.APP,
        status,
        comment = null,
        supplier,
    }: {
        id: string;
        name: string | null;
        createdAt: Date;
        amount: number;
        dueDate: Date | null;
        updatedAt: Date;
        paidAt: Date | null;
        filePath: string | null;
        invoiceNumber: string | null;
        source: InvoiceSource;
        status: InvoiceStatus;
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
    & { id?: string };

import type { InvoiceModel } from "~~/shared/domain/invoice/invoice.model";
import { z } from "zod";
import { UpdateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";

export class InvoiceViewModel {
    constructor(private invoice: InvoiceModel) {}

    get id() {
        return this.invoice.id;
    }

    get name() {
        return this.invoice.name;
    }

    toUpdateForm(): z.input<typeof UpdateInvoiceSchema> {
        return {
            id: this.invoice.id,
            invoiceNumber: this.invoice.number ?? "",
            emitDate: this.invoice.emitDate ?? new Date(),
            dueDate: this.invoice.dueDate ?? new Date(),
            amount: this.invoice.amount ?? 0,
            name: this.invoice.name ?? null,
            comment: this.invoice.comment ?? null,
            paidAt: this.invoice.paidAt ?? null,
            status: this.invoice.status,
        };
    }
}

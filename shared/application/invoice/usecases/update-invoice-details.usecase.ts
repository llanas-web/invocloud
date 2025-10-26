import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { UpdateInvoiceDetailsSchema } from "../commands";

export class UpdateInvoiceDetailsUsecase {
    constructor(private readonly repo: InvoiceRepository) {}

    async execute(raw: unknown) {
        const parsed = UpdateInvoiceDetailsSchema.parse(raw);
        const invoice = await this.repo.getById(parsed.id);
        if (!invoice) throw new Error("Invoice not found");

        let updatedInvoice = invoice.withDetails({
            name: parsed.name,
            amount: parsed.amount ?? undefined,
            emitDate: parsed.emitDate ?? undefined,
            dueDate: parsed.dueDate ?? undefined,
            number: parsed.number ?? undefined,
            comment: parsed.comment ?? undefined,
            paidAt: parsed.paidAt ?? undefined,
        });

        if (parsed.status && parsed.status !== updatedInvoice.status) {
            updatedInvoice = updatedInvoice.changeStatus(parsed.status, {
                paidAt: parsed.paidAt ?? undefined,
            });
        }

        return this.repo.update(updatedInvoice);
    }
}

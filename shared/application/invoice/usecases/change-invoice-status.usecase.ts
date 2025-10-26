import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { ChangeInvoiceStatusSchema } from "../commands";

export class ChangeInvoiceStatusUsecase {
    constructor(private readonly invoiceRepo: InvoiceRepository) {}

    async execute(raw: unknown) {
        const parsed = ChangeInvoiceStatusSchema.parse(raw);
        const entity = await this.invoiceRepo.getById(parsed.id);
        if (!entity) throw new Error("Invoice not found");
        const updatedInvoice = entity.changeStatus(parsed.status, {
            paidAt: parsed.paidAt ?? undefined,
        });
        return this.invoiceRepo.update(updatedInvoice);
    }
}

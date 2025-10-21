import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { ChangeInvoiceStatusSchema } from "../command";

export class ChangeInvoiceStatusUsecase {
    constructor(private readonly repo: InvoiceRepository) {}

    async execute(raw: unknown) {
        const cmd = ChangeInvoiceStatusSchema.parse(raw);
        const entity = await this.repo.getById(cmd.id);
        if (!entity) throw new Error("Invoice not found");
        const next = entity.changeStatus(cmd.status, {
            paidAt: cmd.paidAt ?? undefined,
        });
        return this.repo.update(next);
    }
}

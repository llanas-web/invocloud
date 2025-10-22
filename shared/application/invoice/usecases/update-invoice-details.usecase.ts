import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { UpdateInvoiceDetailsSchema } from "../commands";

export class UpdateInvoiceDetailsUsecase {
    constructor(private readonly repo: InvoiceRepository) {}

    async execute(raw: unknown) {
        const cmd = UpdateInvoiceDetailsSchema.parse(raw);
        const entity = await this.repo.getById(cmd.id);
        if (!entity) throw new Error("Invoice not found");

        let next = entity.withDetails({
            name: cmd.name,
            amount: cmd.amount ?? undefined,
            emitDate: cmd.emitDate ?? undefined,
            dueDate: cmd.dueDate ?? undefined,
            number: cmd.number ?? undefined,
            comment: cmd.comment ?? undefined,
            paidAt: cmd.paidAt ?? undefined,
        });

        if (cmd.status && cmd.status !== entity.status) {
            next = next.changeStatus(cmd.status, {
                paidAt: cmd.paidAt ?? undefined,
            });
        }

        return this.repo.update(next);
    }
}

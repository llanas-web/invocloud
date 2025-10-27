import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

export const ChangeInvoiceStatusCommandSchema = z.object({
    id: z.uuid(),
    status: z.enum(InvoiceStatus),
    paidAt: z.date().nullable().optional(),
}).refine((d) => (d.status === "paid" ? true : d.paidAt == null), {
    message: "paidAt ne doit être défini que si le statut est 'paid'.",
});
export type ChangeInvoiceStatusCommand = z.input<
    typeof ChangeInvoiceStatusCommandSchema
>;

export default class ChangeInvoiceStatusUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: ChangeInvoiceStatusCommand) {
        const parsed = ChangeInvoiceStatusCommandSchema.parse(command);

        const entity = await this.repos.invoicesRepo.getById(parsed.id);
        if (!entity) throw new Error("Invoice not found");
        const updatedInvoice = entity.changeStatus(parsed.status, {
            paidAt: parsed.paidAt ?? undefined,
        });
        return this.repos.invoicesRepo.update(updatedInvoice);
    }
}

import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

export const UpdateInvoiceDetailsSchema = z.object({
    id: z.uuid(),
    name: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    emitDate: z.date().nullable().optional(),
    dueDate: z.date().nullable().optional(),
    number: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    status: z.enum(InvoiceStatus).optional(),
    paidAt: z.date().nullable().optional(),
}).refine((data) => {
    if (data.status === "paid" && data.paidAt === undefined) return true; // on autorise auto-fill
    if (data.status !== "paid" && data.paidAt != null) return false;
    return true;
}, { message: "paidAt n’est cohérent que si le statut est 'paid'." });
export type UpdateInvoiceDetailsCommand = z.input<
    typeof UpdateInvoiceDetailsSchema
>;

export default class UpdateInvoiceDetailsUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: UpdateInvoiceDetailsCommand) {
        const parsed = UpdateInvoiceDetailsSchema.parse(command);

        const invoice = await this.repos.invoicesRepo.getById(parsed.id);
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

        return this.repos.invoicesRepo.update(updatedInvoice);
    }
}

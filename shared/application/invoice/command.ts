import { z } from "zod";
import {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

export const CreateInvoiceSchema = z.object({
    supplierId: z.uuid(),
    filePath: z.string().min(1),
    source: z.enum(InvoiceSource).default(InvoiceSource.APP),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),

    // optional fields
    name: z.string().trim().nullable().optional(),
    invoiceNumber: z.string().trim().nullable().optional(),
    amount: z.number().int().nonnegative().nullable().optional(),
    emitDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    paidAt: z.coerce.date().nullable().optional(),
    comment: z.string().trim().nullable().optional(),
});

export type CreateInvoiceCommand = z.infer<typeof CreateInvoiceSchema>;

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

export const ChangeInvoiceStatusSchema = z.object({
    id: z.uuid(),
    status: z.enum(InvoiceStatus),
    paidAt: z.date().nullable().optional(),
}).refine((d) => (d.status === "paid" ? true : d.paidAt == null), {
    message: "paidAt ne doit être défini que si le statut est 'paid'.",
});

export type ChangeInvoiceStatusCommand = z.input<
    typeof ChangeInvoiceStatusSchema
>;

export const DeleteInvoicesSchema = z.array(z.uuid()).nonempty();

export type DeleteInvoicesCommand = z.infer<typeof DeleteInvoicesSchema>;

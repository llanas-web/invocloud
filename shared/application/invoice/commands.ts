import { z } from "zod";
import {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

export const CreateInvoiceCommandSchema = z.object({
    supplierId: z.uuid(),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),
    file: z.file(),
    establishmentId: z.uuid(),

    // optional fields
    name: z.string().trim().nullable().optional(),
    invoiceNumber: z.string().trim().nullable().optional(),
    amount: z.number().nullable().optional(),
    emitDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    paidAt: z.coerce.date().nullable().optional(),
    comment: z.string().trim().nullable().optional(),
});
export type CreateInvoiceCommand = z.infer<typeof CreateInvoiceCommandSchema>;

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

export const SendInvoiceByEmailCommandSchema = z.object({
    invoiceIds: z.array(z.uuid()).nonempty(),
    recipientEmail: z.email(),
});
export type SendInvoiceByEmailCommand = z.infer<
    typeof SendInvoiceByEmailCommandSchema
>;

export const CreateInvoiceFromUploadSchema = z.object({
    supplierId: z.uuid(),
    establishmentId: z.uuid(),
    comment: z.string().trim().optional(),
    name: z.string().trim(),
});
export type CreateInvoiceFromUploadCommand = z.infer<
    typeof CreateInvoiceFromUploadSchema
>;

export const CheckUploadAuthorizationSchema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
});
export type CheckUploadAuthorizationCommand = z.infer<
    typeof CheckUploadAuthorizationSchema
>;

export const HandleInboundMailCommand = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
    subject: z.string().optional(),
    attachments: z.array(
        z.object({
            name: z.string(),
            content: z.string(),
            contentType: z.string(),
        }),
    ),
});
export type HandleInboundMailCommand = z.infer<
    typeof HandleInboundMailCommand
>;

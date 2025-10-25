import { z } from "zod";
import { amountField } from "./fields";
import {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

export const CreateInvoiceSchema = z.object({
    supplierId: z.uuid("Fournisseur invalide"),
    emitDate: z.date().default(new Date()),
    amount: amountField,
    filePath: z.string().min(1, "Fichier requis"),
    invoiceNumber: z.string().min(1, "Numéro requis"),
    name: z.string().nullable(),
    comment: z.string().nullable(),
    dueDate: z.date(),
    paidAt: z.date().nullable(),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),
    source: z.enum(InvoiceSource).default(InvoiceSource.APP),
}).refine((data) => {
    if (data.status === InvoiceStatus.PAID) {
        return data.paidAt !== null;
    }
    return true;
}, {
    message: "La date de paiement est requise lorsque le statut est 'payé'.",
});

export type CreateInvoiceForm = z.input<typeof CreateInvoiceSchema>;

export const UpdateInvoiceFormSchema = z.object({
    id: z.uuid("Identifiant de facture invalide"),
    invoiceNumber: z.string().default(""),
    emitDate: z.date().default(new Date()),
    dueDate: z.date().default(new Date()),
    amount: amountField,
    name: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    paidAt: z.date().nullable().optional(),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),
}).refine((data) => {
    if (data.status === InvoiceStatus.PAID) {
        return data.paidAt !== null;
    }
    return true;
}, {
    message: "La date de paiement est requise lorsque le statut est 'payé'.",
});
export type UpdateInvoiceForm = z.infer<typeof UpdateInvoiceFormSchema>;

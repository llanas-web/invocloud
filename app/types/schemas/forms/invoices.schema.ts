import { z } from "zod";
import {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/types/models/invoice.model";
import { amountField } from "./fields";

export const CreateInvoiceSchema = z.object({
    supplierId: z.uuid("Fournisseur invalide"),
    amount: amountField,
    filePath: z.string().min(1, "Fichier requis"),
    invoiceNumber: z.string().min(1, "Numéro requis"),
    name: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    dueDate: z.date().nullable().optional(), // Date en domaine
    paidAt: z.date().nullable().optional(),
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
export type CreateInvoiceCommand = z.output<typeof CreateInvoiceSchema>;

export const UpdateInvoiceSchema = z.object({
    amount: amountField,
    name: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    dueDate: z.date().nullable().optional(),
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

export type UpdateInvoiceForm = z.input<typeof UpdateInvoiceSchema>;
export type UpdateInvoiceCommand = z.output<typeof UpdateInvoiceSchema>;

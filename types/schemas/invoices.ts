import { z } from "zod";

export const InvoiceStatusEnum = [
    "pending",
    "paid",
    "sent",
    "validated",
    "error",
] as const;

export const acceptedStatus = ["validated", "paid", "error"];

export const InvoiceWithEstablishmentSchema = z.object({
    id: z.string().uuid(),
    amount: z.number().nullable(),
    comment: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    file_path: z.string().nullable(),
    invoice_number: z.string().nullable(),
    name: z.string().nullable(),
    status: z.enum(InvoiceStatusEnum),
    supplier_id: z.string().uuid(),
    supplier_name: z.string(),
    establishment_id: z.string().uuid(),
    taxe_amount: z.number(),
    due_date: z.string().nullable(),
    overdue: z.boolean(),
});

export type InvoiceWithEstablishment = z.infer<
    typeof InvoiceWithEstablishmentSchema
>;

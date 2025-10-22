import { z } from "zod";

export const UpdateSupplierDetailsSchema = z.object({
    id: z.uuid(),
    name: z.string().nullable().optional(),
    emails: z.array(z.email()).nullable().optional(),
    phone: z.string().nullable().optional(),
});
export type UpdateSupplierDetailsCommand = z.input<
    typeof UpdateSupplierDetailsSchema
>;

export const CreateSupplierSchema = z.object({
    establishmentId: z.uuid(),
    name: z.string().min(1),
    emails: z.array(z.email()).default([]),
});

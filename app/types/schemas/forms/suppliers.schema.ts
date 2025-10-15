import { z } from "zod";

export const CreateSupplierSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    emails: z.array(z.email("Email invalide")).min(
        1,
        "Au moins un email est requis",
    ),
});

export type CreateSupplierForm = z.input<typeof CreateSupplierSchema>;
export type CreateSupplierCommand = z.output<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    emails: z.array(z.email("Email invalide")).min(
        1,
        "Au moins un email est requis",
    ),
});

export type UpdateSupplierForm = z.input<typeof UpdateSupplierSchema>;
export type UpdateSupplierCommand = z.output<typeof UpdateSupplierSchema>;

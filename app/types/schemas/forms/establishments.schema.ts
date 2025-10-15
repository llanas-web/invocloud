import { z } from "zod";

export const CreateEstablishmentSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    address: z.string().min(1, "Adresse requise"),
    phone: z.string().nullable().optional(),
    prefixEmail: z.string().nullable().optional(),
});

export type CreateEstablishmentForm = z.input<typeof CreateEstablishmentSchema>;
export type CreateEstablishmentCommand = z.output<
    typeof CreateEstablishmentSchema
>;

import { z } from "zod";

export const CreateEstablishmentCommandSchema = z.object({
    creatorId: z.uuid(),
    name: z.string().min(1).max(255),
    emailPrefix: z.string().min(1).max(100),
    address: z.string().min(1).max(500).optional(),
    phone: z.string().min(1).max(20).optional(),
});

export type CreateEstablishmentCommand = z.infer<
    typeof CreateEstablishmentCommandSchema
>;

export const UpdateEstablishmentCommandSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    emailPrefix: z.string().min(1).max(100).optional(),
    address: z.string().min(1).max(500).optional(),
    phone: z.string().min(1).max(20).optional(),
});

export type UpdateEstablishmentCommand = z.infer<
    typeof UpdateEstablishmentCommandSchema
>;

export const DeleteEstablishmentsCommandSchema = z
    .array(z.uuid())
    .nonempty();

export type DeleteEstablishmentsCommand = z.infer<
    typeof DeleteEstablishmentsCommandSchema
>;

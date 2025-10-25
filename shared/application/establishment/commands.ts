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

export const InviteMemberCommandSchema = z.object({
    establishmentId: z.uuid(),
    email: z.email().max(255),
    role: z.enum(["admin", "member"]),
});
export type InviteMemberCommand = z.infer<
    typeof InviteMemberCommandSchema
>;

export const CreateCheckoutSessionCommandSchema = z.object({
    establishmentId: z.uuid(),
});
export type CreateCheckoutSessionCommand = z.infer<
    typeof CreateCheckoutSessionCommandSchema
>;

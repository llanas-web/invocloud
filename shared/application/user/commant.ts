import { z } from "zod";

export const UpdateUserDetailsSchema = z.object({
    id: z.uuid(),
    fullName: z.string().min(1).optional(),
});
export type UpdateUserDetailsCommand = z.input<
    typeof UpdateUserDetailsSchema
>;

export const ToggleFavoriteEstablishmentSchema = z.object({
    userId: z.uuid(),
    establishmentId: z.uuid(),
});
export type ToggleFavoriteEstablishmentCommand = z.input<
    typeof ToggleFavoriteEstablishmentSchema
>;

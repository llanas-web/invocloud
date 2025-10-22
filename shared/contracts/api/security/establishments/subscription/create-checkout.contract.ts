import { z } from "zod";

export const CreateCheckoutSessionBodySchema = z.object({
    establishmentId: z.uuid(),
    userId: z.uuid(),
});

export const CreateCheckoutSessionResponseSchema = z.object({
    url: z.url(),
});

export type CreateCheckoutSessionBody = z.infer<
    typeof CreateCheckoutSessionBodySchema
>;
export type CreateCheckoutSessionResponse = z.infer<
    typeof CreateCheckoutSessionResponseSchema
>;

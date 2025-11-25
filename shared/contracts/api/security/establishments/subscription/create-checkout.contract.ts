import { z } from "zod";

export const CreateCheckoutSessionBodySchema = z.object({
    userId: z.uuid(),
    subscriptionPlanId: z.uuid(),
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

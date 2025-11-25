import { z } from "zod";

export const ActivateSubscriptionBodySchema = z.object({
    userId: z.uuid(),
    subscriptionPlanId: z.uuid(),
});

export const ActivateSubscriptionResponseSchema = z.undefined();

export type ActivateSubscriptionBody = z.infer<
    typeof ActivateSubscriptionBodySchema
>;
export type ActivateSubscriptionResponse = z.infer<
    typeof ActivateSubscriptionResponseSchema
>;

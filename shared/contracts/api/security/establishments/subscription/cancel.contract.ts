import { z } from "zod";

export const CancelSubscriptionBodySchema = z.object({
    userId: z.uuid(),
});

export const CancelSubscriptionResponseSchema = z.undefined();

export type CancelSubscriptionBody = z.infer<
    typeof CancelSubscriptionBodySchema
>;
export type CancelSubscriptionResponse = z.infer<
    typeof CancelSubscriptionResponseSchema
>;

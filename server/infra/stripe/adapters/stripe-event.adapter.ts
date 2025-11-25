import Stripe from "stripe";
import type {
    CheckoutSessionCreatedDto,
    SubscriptionUpdatedDto,
} from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";
import { z } from "zod";
import { SubscriptionStatus } from "~~/shared/domain/user/subscription.entity";

export const sessionMetadataSchema = z.object({
    userId: z.uuid(),
    subscriptionPlanId: z.string(),
});

export class StripeEventAdapter {
    static toSubscriptionStatus(status: string) {
        switch (status) {
            case "active":
                return SubscriptionStatus.ACTIVE;
            case "past_due":
                return SubscriptionStatus.PAST_DUE;
            case "canceled":
                return SubscriptionStatus.CANCELED;
            default:
                throw new Error(`Unknown subscription status: ${status}`);
        }
    }

    static toCheckoutSessionCreated(
        session: Stripe.Checkout.Session,
        subscription: Stripe.Subscription,
    ): CheckoutSessionCreatedDto {
        const { userId, subscriptionPlanId } = sessionMetadataSchema.parse(
            session.metadata,
        );
        return {
            userId,
            subscriptionPlanId,
            trialEndDate: new Date(subscription.trial_end! * 1000),
            subscriptionId: session.subscription as string,
            customerId: session.customer as string,
        };
    }

    static toSubscriptionUpdated(
        subscription: Stripe.Subscription,
    ): SubscriptionUpdatedDto {
        return {
            subscriptionId: subscription.id,
            status: subscription.cancel_at !== null
                ? SubscriptionStatus.CANCELED
                : this.toSubscriptionStatus(subscription.status),
        };
    }
}

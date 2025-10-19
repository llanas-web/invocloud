import type {
    SubscriptionModel,
    SubscriptionStatus,
} from "~~/shared/types/models/subscription.model";
import type { Subscription } from "~~/shared/types/providers/database";

export const subscriptionMapperFromDatabase = (
    subscription: Subscription,
): SubscriptionModel => {
    return {
        id: subscription.id,
        establishmentId: subscription.establishment_id,
        provider: subscription.provider as SubscriptionModel["provider"],
        providerSubscriptionId: subscription.provider_subscription_id,
        providerCustomerId: subscription.provider_customer_id,
        status: subscription.status as SubscriptionStatus,
        startedAt: fromStringToLocalDate(subscription.started_at),
        endAt: subscription.end_at
            ? fromStringToLocalDate(subscription.end_at)
            : null,
    };
};

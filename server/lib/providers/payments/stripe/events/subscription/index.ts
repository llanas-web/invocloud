import type Stripe from "stripe";
import { fromUnix, nowISO } from "~/utils/date";
import { Deps } from "~~/server/core/types";
import PaymentError from "~~/shared/providers/payment/payment.error";
import { SubscriptionStatus } from "~~/shared/types/models/subscription.model";

const getCustomerId = (customer: Stripe.Subscription["customer"]) => {
    if (typeof customer === "string") {
        return customer;
    } else if (customer && typeof customer === "object" && customer.id) {
        return customer.id;
    }
    return null;
};

export async function handleSubscriptionDeleted(
    stripe: Stripe,
    subscription: Stripe.Subscription,
    deps: Deps,
) {
    const customerId = getCustomerId(subscription.customer);
    if (!customerId) {
        throw new PaymentError(
            "Missing customer ID in invoice.payment_succeeded",
        );
    }
    const { subscriptionRepository } = deps.database;
    const { id } = await subscriptionRepository.getSubscriptionById(
        customerId,
    );
    await subscriptionRepository.updateSubscription(
        id,
        {
            status: SubscriptionStatus.INACTIVE,
            end_at: fromUnix(subscription.ended_at) || nowISO(),
        },
    );
}

export async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    deps: Deps,
) {
    const customerId = getCustomerId(subscription.customer);
    if (!customerId) {
        throw new PaymentError(
            "Missing customer ID in subscription.updated",
        );
    }
    const { subscriptionRepository } = deps.database;

    const subscriptionStatus = subscription.status === "canceled"
        ? SubscriptionStatus.CANCELED
        : SubscriptionStatus.ACTIVE;

    const { id } = await subscriptionRepository.getSubscriptionById(
        customerId,
    );
    await subscriptionRepository.updateSubscription(
        id,
        {
            status: subscriptionStatus,
            end_at: fromUnix(subscription.ended_at),
        },
    );
}

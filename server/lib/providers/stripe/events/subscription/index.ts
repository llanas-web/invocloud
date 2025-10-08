import type Stripe from "stripe";
import { StripeHandlerContext } from "~~/server/lib/stripe/context";
import { fromUnix, nowISO } from "~/utils/date";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

const getCustomerId = (customer: Stripe.Subscription["customer"]) => {
    if (typeof customer === "string") {
        return customer;
    } else if (customer && typeof customer === "object" && customer.id) {
        return customer.id;
    }
    return null;
};

export async function handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    ctx: StripeHandlerContext,
) {
    const customerId = getCustomerId(subscription.customer);
    const establishmentRepository = createEstablishmentRepository(ctx.supabase);
    if (!customerId) {
        console.error("❌ Missing customer ID in subscription.deleted");
        return;
    }

    const { error } = await establishmentRepository.updateEstablishment(
        customerId,
        {
            subscription_status: "inactive",
            subscription_end: fromUnix(subscription.ended_at) || nowISO(),
        },
    );

    if (error) {
        console.error("❌ Failed to mark subscription as inactive:", error);
    } else {
        console.log(
            `✅ Subscription marked inactive for customer ${customerId}`,
        );
    }
}

export async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    ctx: StripeHandlerContext,
) {
    const customerId = getCustomerId(subscription.customer);
    const establishmentRepository = createEstablishmentRepository(ctx.supabase);
    if (!customerId) {
        console.error("❌ Missing customer ID in subscription.updated");
        return;
    }
    console.log(subscription);

    const subscriptionStatus = subscription.status === "canceled"
        ? "canceled"
        : "active";

    // Update the subscription status and end date
    const { error } = await establishmentRepository.updateEstablishment(
        customerId,
        {
            subscription_status: subscriptionStatus,
            subscription_end: fromUnix(subscription.ended_at),
        },
    );

    if (error) {
        console.error("❌ Failed to update subscription status:", error);
    } else {
        console.log(
            `✅ Subscription updated for customer ${customerId}: status=${subscriptionStatus}`,
        );
    }
}

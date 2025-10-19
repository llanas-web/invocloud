import type Stripe from "stripe";
import { fromUnix } from "~/utils/date";
import { Deps } from "~~/server/core/types";
import PaymentError from "~~/shared/providers/payment/payment.error";

const getCustomerId = (customer: Stripe.Invoice["customer"]) => {
    if (typeof customer === "string") {
        return customer;
    } else if (customer && typeof customer === "object" && customer.id) {
        return customer.id;
    }
    return null;
};

export async function handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    deps: Deps,
) {
    const customerId = getCustomerId(invoice.customer);
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
            end_at: fromUnix(invoice.period_end),
        },
    );
}

import { Stripe } from "stripe";

const fromAnyToSubscription = (
    subscription: { id: string } | string,
) => {
    if (!subscription) return null;
    return (typeof subscription === "string" ? subscription : subscription.id);
};

export const fromSessionToSubscription = (session: Stripe.Checkout.Session) => {
    if (!session.subscription) return null;
    return fromAnyToSubscription(session.subscription);
};

export const fromInvoiceToSubscription = (invoice: Stripe.Invoice) => {
    if (!invoice.parent || !invoice.parent.subscription_details) return null;
    return fromAnyToSubscription(
        invoice.parent.subscription_details.subscription,
    );
};

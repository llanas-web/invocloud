import { Stripe } from "stripe";

const fromAnyToSubscription = (
    subscription: { id: string } | string,
) => {
    console.log("subscription: ", subscription);
    if (!subscription) return null;
    return (typeof subscription === "string" ? subscription : subscription.id);
};

export const fromSessionToSubscription = (session: Stripe.Checkout.Session) => {
    console.log("session.subscription: ", session.subscription);
    if (!session.subscription) return null;
    return fromAnyToSubscription(session.subscription);
};

export const fromInvoiceToSubscription = (invoice: Stripe.Invoice) => {
    console.log("invoice.parent: ", invoice.parent);
    if (!invoice.parent || !invoice.parent.subscription_details) return null;
    return fromAnyToSubscription(
        invoice.parent.subscription_details.subscription,
    );
};

import { Stripe } from "stripe";

export const fromSessionToSubscription = (session: Stripe.Checkout.Session) => {
    if (!session.subscription) return null;
    return (typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id);
};

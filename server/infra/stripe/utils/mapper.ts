import { Stripe } from "stripe";

export const fromSessionToSubscription = (session: Stripe.Checkout.Session) => {
    console.log("session.subscription: ", session.subscription);
    if (!session.subscription) return null;
    return (typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id);
};

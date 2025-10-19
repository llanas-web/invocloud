import type { PaymentProviderInterface } from "../payment.interface";
import Stripe from "stripe";
import {
    generateCreateCheckoutSessionObject,
    mapCheckoutSessionToPaymentSession,
} from "./mapper/stripe.mapper";

export class StripeRepository implements PaymentProviderInterface {
    private STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;
    private STRIPE_API_VERSION = import.meta.env.STRIPE_API_VERSION ??
        "2025-09-30.clover";

    constructor() {
        console.log("Using Stripe API Version:", this.STRIPE_API_VERSION);
        console.log("Using Stripe Secret Key:", this.STRIPE_SECRET_KEY);
    }

    public stripeInstance = new Stripe(this.STRIPE_SECRET_KEY!, {
        // @ts-ignore
        apiVersion: this.STRIPE_API_VERSION,
    });

    async createSubscription(
        userId: string,
        userEmail: string,
        establishmentId: string,
    ) {
        const checkoutSessionObject = generateCreateCheckoutSessionObject(
            userId,
            userEmail,
            establishmentId,
        );
        const session = await this.stripeInstance.checkout.sessions.create(
            checkoutSessionObject,
        );
        return mapCheckoutSessionToPaymentSession(session);
    }

    async cancelSubscription(subscriptionId: string) {
        await this.stripeInstance.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    async cancelTrialingPeriod(subscriptionId: string) {
        await this.stripeInstance.subscriptions.cancel(subscriptionId);
    }
}

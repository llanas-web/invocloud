import Stripe from "stripe";
import {
    generateCreateCheckoutSessionObject,
    mapCheckoutSessionToPaymentSession,
} from "./mapper/stripe.mapper";
import { PaymentRepository } from "#shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";

export class PaymentStripeRepository implements PaymentRepository {
    public stripeInstance: Stripe;
    constructor() {
        const config = useRuntimeConfig();
        this.stripeInstance = new Stripe(config.STRIPE_SECRET_KEY!, {
            apiVersion: config.STRIPE_API_VERSION ?? "2025-09-30.clover",
        });
    }

    async createCheckoutSession(
        userId: string,
        establishmentId: string,
    ) {
        const checkoutSessionObject = generateCreateCheckoutSessionObject(
            userId,
            establishmentId,
        );
        const session = await this.stripeInstance.checkout.sessions.create(
            checkoutSessionObject,
        );
        if (!session.url) {
            throw new ApplicationError("Failed to create checkout session URL");
        }
        return session.url;
    }

    async createSubscription(
        userEmail: string,
        establishmentId: string,
    ) {
        const checkoutSessionObject = generateCreateCheckoutSessionObject(
            userEmail,
            establishmentId,
        );
        const session = await this.stripeInstance.checkout.sessions.create(
            checkoutSessionObject,
        );
        return session.url!;
    }

    async cancelSubscription(subscriptionId: string) {
        const subscription = await this.stripeInstance.subscriptions.update(
            subscriptionId,
            {
                cancel_at_period_end: true,
            },
        );
        return subscription.cancel_at!;
    }

    async cancelTrialingPeriod(subscriptionId: string) {
        await this.stripeInstance.subscriptions.cancel(subscriptionId);
    }
}

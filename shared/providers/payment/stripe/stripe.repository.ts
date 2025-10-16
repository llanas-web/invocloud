import type { SubscriptionEvent } from "~~/shared/types/providers/payment/types";
import type { PaymentProviderInterface } from "../payment.interface";
import type { UserModel } from "~~/shared/types/models/user.model";
import Stripe from "stripe";
import {
    generateCreateCheckoutSessionObject,
    mapCheckoutSessionToPaymentSession,
} from "./mapper/stripe.mapper";

export class StripeRepository implements PaymentProviderInterface {
    private STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    private STRIPE_API_VERSION = process.env.STRIPE_API_VERSION ??
        "2025-09-30.clover";

    private stripeInstance = new Stripe(this.STRIPE_SECRET_KEY!, {
        // @ts-ignore
        apiVersion: this.STRIPE_API_VERSION,
    });

    onSubscriptionChange(
        callback: (event: SubscriptionEvent, subscriptionId: string) => void,
    ) {
        // Implementation here
    }

    async createSubscription(
        user: UserModel,
        establishmentId: string,
    ) {
        const checkoutSessionObject = generateCreateCheckoutSessionObject(
            user.id,
            user.email,
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

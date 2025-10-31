import Stripe from "stripe";
import { PaymentRepository } from "#shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import { CreateCheckoutSessionDto } from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";

class PaymentStripeRepository implements PaymentRepository {
    public stripeInstance: Stripe;
    private priceId: string;
    private baseUrl: string;

    constructor() {
        const config = useRuntimeConfig();
        this.stripeInstance = new Stripe(config.stripeSecretKey!, {
            apiVersion:
                config.stripeApiVersion as Stripe.StripeConfig["apiVersion"] ??
                    "2025-09-30.clover",
        });
        this.priceId = config.stripePriceId!;
        this.baseUrl = config.baseUrl!;
    }

    async createCheckoutSession(
        { email, userId, establishmentId, customerId }:
            CreateCheckoutSessionDto,
    ): Promise<string> {
        try {
            const metadata = {
                userId,
                establishmentId,
            };
            const session = await this.stripeInstance.checkout.sessions.create(
                {
                    mode: "subscription",
                    customer_email: customerId ? undefined : email,
                    customer: customerId,
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price: this.priceId,
                            quantity: 1,
                        },
                    ],
                    subscription_data: {
                        trial_period_days: 7,
                        metadata,
                    },
                    success_url:
                        `${this.baseUrl}/app?subscription_success=true`,
                    cancel_url:
                        `${this.baseUrl}/app/settings/establishments?cancel=true`,
                    metadata,
                },
            );

            if (!session.url) {
                throw new ApplicationError(
                    "Failed to create checkout session URL",
                );
            }
            return session.url;
        } catch (error) {
            throw new ApplicationError(
                "Failed to create checkout session",
                { cause: error },
            );
        }
    }

    async retreiveSubscription(subscriptionId: string) {
        const subscription = await this.stripeInstance.subscriptions.retrieve(
            subscriptionId,
        );
        return subscription;
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

export default PaymentStripeRepository;

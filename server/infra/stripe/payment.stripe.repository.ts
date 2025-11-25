import Stripe from "stripe";
import { PaymentRepository } from "#shared/application/common/providers/payment/payment.repository";
import { CreateCheckoutSessionDto } from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";
import { StripeError } from "./stripe.error";
import { SubscriptionPlanDTO } from "~~/shared/application/subscription-plan/dto/subscription-plan.dto";

class PaymentStripeRepository implements PaymentRepository {
    public stripeInstance: Stripe;
    private baseUrl: string;

    constructor() {
        const config = useRuntimeConfig();
        this.stripeInstance = new Stripe(config.stripeSecretKey!, {
            apiVersion:
                config.stripeApiVersion as Stripe.StripeConfig["apiVersion"] ??
                    "2025-10-29.clover",
        });
        this.baseUrl = config.baseUrl!;
    }

    async createCheckoutSession(
        { email, userId, customerId, subscriptionPlan }:
            CreateCheckoutSessionDto,
    ) {
        try {
            const metadata = {
                userId,
                subscriptionPlanId: subscriptionPlan.id,
            };
            const session = await this.stripeInstance.checkout.sessions.create(
                {
                    mode: "subscription",
                    customer_email: customerId ? undefined : email,
                    customer: customerId,
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price: subscriptionPlan.subscriptionPriceId,
                            quantity: 1,
                        },
                        {
                            price: subscriptionPlan.metricPriceId,
                        },
                    ],
                    success_url:
                        `${this.baseUrl}/app?subscription_success=true`,
                    cancel_url:
                        `${this.baseUrl}/app/settings/establishments?cancel=true`,
                    metadata,
                },
            );
            return session.url;
        } catch (error) {
            throw StripeError.fromStripeError(
                error as Stripe.errors.StripeError,
            );
        }
    }

    async activateSubscription(subscriptionId: string) {
        await this.stripeInstance.subscriptions.update(
            subscriptionId,
            {
                cancel_at_period_end: false,
            },
        );
    }

    async updateSubscriptionPlan(
        subscriptionId: string,
        subscriptionPlan: SubscriptionPlanDTO,
    ) {
        const existingSubscription = await this.stripeInstance.subscriptions
            .retrieve(subscriptionId);
        const deletedItems = existingSubscription.items.data.map((item) => ({
            id: item.id,
            deleted: true,
        }));
        await this.stripeInstance.subscriptions.update(
            subscriptionId,
            {
                items: [
                    ...deletedItems,
                    {
                        price: subscriptionPlan.subscriptionPriceId,
                        quantity: 1,
                    },
                    {
                        price: subscriptionPlan.metricPriceId,
                    },
                ],
            },
        );
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
}

export default PaymentStripeRepository;

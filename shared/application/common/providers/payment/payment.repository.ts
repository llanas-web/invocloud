import type { SubscriptionPlanDTO } from "~~/shared/application/subscription-plan/dto/subscription-plan.dto";
import type { CreateCheckoutSessionDto } from "./dtos/payment-event.dto";

export interface PaymentRepository {
    createCheckoutSession(
        createCheckoutSessionDto: CreateCheckoutSessionDto,
    ): Promise<string | null>;
    activateSubscription(subscriptionId: string): Promise<void>;
    updateSubscriptionPlan(
        subscriptionId: string,
        subscriptionPlan: SubscriptionPlanDTO,
    ): Promise<void>;
    cancelSubscription(subscriptionId: string): Promise<number>;
}

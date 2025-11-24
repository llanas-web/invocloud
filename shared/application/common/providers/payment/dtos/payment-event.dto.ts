import type { SubscriptionPlanDTO } from "~~/shared/application/subscription-plan/dto/subscription-plan.dto";
import type { SubscriptionStatus } from "~~/shared/domain/user/subscription.entity";

export interface CreateCheckoutSessionDto {
    email: string;
    userId: string;
    subscriptionPlan: SubscriptionPlanDTO;
    customerId?: string;
}

export interface CheckoutSessionCreatedDto {
    userId: string;
    customerId: string;
    subscriptionId: string;
    trialEndDate: Date;
    subscriptionPlanId: string;
}

export interface InvoicePaymentSucceededDto {
    subscriptionId: string;
    provider: string;
    periodEndAt: Date;
}

export interface SubscriptionUpdatedDto {
    subscriptionId: string;
    status: SubscriptionStatus;
}

export interface SubscriptionDeletedDto {
    subscriptionId: string;
}

export interface PaymentFailedDto {
    subscriptionId: string;
}

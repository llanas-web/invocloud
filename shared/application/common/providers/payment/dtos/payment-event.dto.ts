import type { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";

export interface CreateCheckoutSessionDto {
    email: string;
    userId: string;
    establishmentId: string;
    customerId?: string;
    subscriptionId?: string;
}

export interface CheckoutSessionCreatedDto {
    establishmentId: string;
    customerId: string;
    subscriptionId: string;
    trialEndDate: Date;
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

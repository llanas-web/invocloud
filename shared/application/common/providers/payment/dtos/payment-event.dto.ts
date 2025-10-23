import type { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";

export interface CheckoutSessionCreatedDto {
    establishmentId: string;
    customerId: string;
    subscriptionId: string;
    trialEndDate: Date;
}

export interface InvoicePaymentSucceededDto {
    establishmentId: string;
    periodEnd: Date;
    invoiceId: string;
    amount: number;
    currency: string;
}

export interface SubscriptionUpdatedDto {
    establishmentId: string;
    currentPeriodEnd: Date;
    status: SubscriptionStatus;
}

export interface SubscriptionDeletedDto {
    establishmentId: string;
    endedAt: Date;
}

export interface PaymentFailedDto {
    establishmentId: string;
}

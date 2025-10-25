import Stripe from "stripe";
import type {
    CheckoutSessionCreatedDto,
    InvoicePaymentSucceededDto,
    PaymentFailedDto,
    SubscriptionDeletedDto,
    SubscriptionUpdatedDto,
} from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";
import { z } from "zod";
import { fromUnix } from "~/utils/date";
import { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";

export const sessionMetadataSchema = z.object({
    establishmentId: z.uuid(),
    userId: z.uuid(),
});

export class StripeEventAdapter {
    static toSubscriptionStatus(status: string) {
        switch (status) {
            case "trialing":
                return SubscriptionStatus.TRIALING;
            case "active":
                return SubscriptionStatus.ACTIVE;
            case "past_due":
                return SubscriptionStatus.PAST_DUE;
            case "canceled":
                return SubscriptionStatus.CANCELED;
            default:
                throw new Error(`Unknown subscription status: ${status}`);
        }
    }

    static toCheckoutSessionCreated(
        session: Stripe.Checkout.Session,
        subscription: Stripe.Subscription,
    ): CheckoutSessionCreatedDto {
        const { establishmentId, userId } = sessionMetadataSchema.parse(
            session.metadata,
        );
        return {
            establishmentId,
            trialEndDate: new Date(subscription.trial_end! * 1000),
            subscriptionId: session.subscription as string,
            customerId: session.customer as string,
        };
    }

    static toInvoicePaymentSucceeded(
        invoice: Stripe.Invoice,
    ): InvoicePaymentSucceededDto {
        const { establishmentId } = sessionMetadataSchema.parse(
            invoice.metadata,
        );
        return {
            establishmentId,
            periodEnd: new Date(invoice.period_end * 1000),
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
        };
    }

    static toSubscriptionUpdated(
        subscription: Stripe.Subscription,
    ): SubscriptionUpdatedDto {
        const { establishmentId } = sessionMetadataSchema.parse(
            subscription.metadata,
        );
        return {
            establishmentId,
            currentPeriodEnd: new Date(subscription.ended_at! * 1000),
            status: this.toSubscriptionStatus(subscription.status),
        };
    }

    static toSubscriptionDeleted(
        subscription: Stripe.Subscription,
    ): SubscriptionDeletedDto {
        const { establishmentId } = sessionMetadataSchema.parse(
            subscription.metadata,
        );
        return {
            establishmentId,
            endedAt: new Date(subscription.ended_at! * 1000),
        };
    }

    static toPaymentFailed(
        invoice: Stripe.Invoice,
    ): PaymentFailedDto {
        const { establishmentId } = sessionMetadataSchema.parse(
            invoice.metadata,
        );
        return {
            establishmentId,
        };
    }
}

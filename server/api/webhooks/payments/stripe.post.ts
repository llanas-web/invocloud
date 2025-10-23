import {
    createError,
    defineEventHandler,
    getRequestHeaders,
    readRawBody,
} from "h3";
import Stripe from "stripe";
import { buildRequestScope } from "~~/server/core/container";
import ServerError from "~~/server/core/errors";
import { HTTPStatus } from "~~/server/core/errors/status";
import { StripeEventAdapter } from "~~/server/lib/providers/payments/stripe/adapters/stripe-event.adapter";
import { PaymentStripeRepository } from "~~/server/lib/providers/payments/stripe/payment.stripe.repository";
import { fromSessionToSubscription } from "~~/server/lib/providers/payments/stripe/utils/mapper";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";

export default defineEventHandler(async (event) => {
    const sig = getRequestHeaders(event)["stripe-signature"] as string;
    const rawBody = await readRawBody(event);
    const usecase = useServerUsecases(event);
    const { handlePaymentEvents } = usecase.establishments.subscription;
    const { stripeWebhookSecret } = useRuntimeConfig();

    if (!sig || !rawBody) {
        throw createError({
            statusCode: 400,
            statusMessage:
                "Signature Stripe manquante ou corps de requête vide",
        });
    }

    const stripeRepository = new PaymentStripeRepository();
    const stripeEvent = stripeRepository.stripeInstance.webhooks
        .constructEvent(
            rawBody,
            sig,
            stripeWebhookSecret,
        );
    const eventData = stripeEvent.data as unknown;
    switch (stripeEvent.type) {
        case "checkout.session.completed":
            const session = eventData as Stripe.Checkout.Session;
            const subscriptionId = fromSessionToSubscription(session);
            if (!subscriptionId) {
                throw new ServerError(
                    HTTPStatus.BAD_REQUEST,
                    "No subscription ID found in checkout session",
                );
            }
            const subscription = await stripeRepository.retreiveSubscription(
                subscriptionId,
            );
            const checkoutSessionDTO = StripeEventAdapter
                .toCheckoutSessionCreated(
                    session,
                    subscription,
                );
            await handlePaymentEvents.handleTrialSucceeded(
                checkoutSessionDTO,
            );
            break;
        case "invoice.payment_succeeded":
            const invoicePaymentData = eventData as Stripe.Invoice;
            const invoicePaymentDTO = StripeEventAdapter
                .toInvoicePaymentSucceeded(
                    invoicePaymentData,
                );
            await handlePaymentEvents.handleInvoicePaymentSucceeded(
                invoicePaymentDTO,
            );
            break;
        case "customer.subscription.updated":
            const subscriptionUpdatedData = eventData as Stripe.Subscription;
            const subscriptionDTO = StripeEventAdapter
                .toSubscriptionUpdated(
                    subscriptionUpdatedData,
                );
            await handlePaymentEvents.handleSubscriptionUpdated(
                subscriptionDTO,
            );
            break;
        case "customer.subscription.deleted":
            const subscriptionDeletedData = eventData as Stripe.Subscription;
            const subscriptionDeletedDTO = StripeEventAdapter
                .toSubscriptionDeleted(
                    subscriptionDeletedData,
                );
            await handlePaymentEvents.handleSubscriptionDeleted(
                subscriptionDeletedDTO,
            );
            break;
        case "invoice.payment_failed":
            const paymentFailedData = eventData as Stripe.Invoice;
            const paymentFailedDTO = StripeEventAdapter
                .toPaymentFailed(
                    paymentFailedData,
                );
            await handlePaymentEvents.handlePaymentFailed(
                paymentFailedDTO,
            );
            break;
        default:
            console.log(
                `No handler for Stripe event type: ${stripeEvent.type}`,
            );
    }
});

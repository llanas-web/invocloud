import {
    createError,
    defineEventHandler,
    getRequestHeaders,
    readRawBody,
} from "h3";
import Stripe from "stripe";
import { buildRequestScope } from "~~/server/core/container";
import { handleCheckoutSessionCompleted } from "~~/server/lib/providers/payments/stripe/events/checkout/session";
import { handleInvoicePaymentSucceeded } from "~~/server/lib/providers/payments/stripe/events/invoice/payment";
import {
    handleSubscriptionDeleted,
    handleSubscriptionUpdated,
} from "~~/server/lib/providers/payments/stripe/events/subscription";
import { StripeRepository } from "~~/shared/providers/payment/stripe/stripe.repository";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default defineEventHandler(async (event) => {
    const sig = getRequestHeaders(event)["stripe-signature"] as string;
    const rawBody = await readRawBody(event);
    const { deps } = await buildRequestScope(event);

    if (!sig || !rawBody) {
        throw createError({
            statusCode: 400,
            statusMessage:
                "Signature Stripe manquante ou corps de requête vide",
        });
    }

    const stripeRepository = new StripeRepository();
    const { type, data } = stripeRepository.stripeInstance.webhooks
        .constructEvent(
            rawBody,
            sig,
            endpointSecret,
        );

    switch (type) {
        case "checkout.session.completed":
            return handleCheckoutSessionCompleted(
                stripeRepository.stripeInstance,
                data as unknown as Stripe.Checkout.Session,
                deps,
            );
        case "invoice.payment_succeeded":
            return handleInvoicePaymentSucceeded(
                data as unknown as Stripe.Invoice,
                deps,
            );
        case "customer.subscription.updated":
            return handleSubscriptionUpdated(
                data as unknown as Stripe.Subscription,
                deps,
            );
        case "customer.subscription.deleted":
        case "invoice.payment_failed":
            return handleSubscriptionDeleted(
                stripeRepository.stripeInstance,
                data as unknown as Stripe.Subscription,
                deps,
            );

        default:
            console.log(`No handler for Stripe event type: ${type}`);
    }
});

import type { Stripe } from "stripe";
import type { H3Event } from "h3";

import { stripe } from "./client";
import { serverSupabaseServiceRole } from "#supabase/server";
import { StripeHandlerContext } from "./context";

import { handleCheckoutSessionCompleted } from "./events/checkout/session";
import { handleInvoicePaymentSucceeded } from "./events/invoice/payment";
import {
    handleSubscriptionDeleted,
    handleSubscriptionUpdated,
} from "./events/subscription";

export async function handleStripeEvent(
    type: string,
    data: Stripe.Event.Data.Object,
    event: H3Event,
) {
    const ctx: StripeHandlerContext = {
        stripe,
        supabase: serverSupabaseServiceRole(event),
    };

    switch (type) {
        case "checkout.session.completed":
            return handleCheckoutSessionCompleted(
                data as Stripe.Checkout.Session,
                ctx,
            );
        case "invoice.payment_succeeded":
            return handleInvoicePaymentSucceeded(data as Stripe.Invoice, ctx);
        case "customer.subscription.updated":
            return handleSubscriptionUpdated(data as Stripe.Subscription, ctx);
        case "customer.subscription.deleted":
        case "invoice.payment_failed":
            return handleSubscriptionDeleted(data as Stripe.Subscription, ctx);

        default:
            console.log(`No handler for Stripe event type: ${type}`);
    }
}

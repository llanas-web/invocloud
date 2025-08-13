import {
    createError,
    defineEventHandler,
    getRequestHeaders,
    readRawBody,
} from "h3";
import { stripe } from "@/server/lib/stripe/client";
import { handleStripeEvent } from "@/server/lib/stripe/dispatcher";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default defineEventHandler(async (event) => {
    const sig = getRequestHeaders(event)["stripe-signature"] as string;
    const rawBody = await readRawBody(event);

    if (!sig || !rawBody) {
        throw createError({
            statusCode: 400,
            statusMessage:
                "Signature Stripe manquante ou corps de requête vide",
        });
    }

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            endpointSecret,
        );
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        throw createError({
            statusCode: 400,
            statusMessage: "Signature Stripe invalide",
        });
    }

    const { type, data } = stripeEvent;

    try {
        await handleStripeEvent(type, data.object, event);
    } catch (err) {
        console.error(`❌ Error handling Stripe event ${type}:`, err);
        throw createError({
            statusCode: 500,
            statusMessage: "Erreur lors du traitement de l'événement Stripe",
        });
    }

    return { received: true };
});

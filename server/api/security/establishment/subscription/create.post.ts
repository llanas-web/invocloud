import { defineEventHandler, readBody } from "h3";
import { serverSupabaseUser } from "#supabase/server";
import { stripe } from "~~/server/lib/providers/payments/stripe/client";

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);

    const parsed = createCheckoutSessionSchema.safeParse(rawBody);
    if (!parsed.success) {
        console.error("❌ Invalid request body", parsed.error.flatten());
        throw createError({
            statusCode: 400,
            statusMessage: "Données de requête invalides",
        });
    }

    const { establishmentId } = parsed.data;

    const user = await serverSupabaseUser(event);
    if (!user || !user.email) {
        console.error("❌ User is not authenticated or missing email");
        throw createError({
            statusCode: 401,
            statusMessage: "Non autorisé",
        });
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID!,
                quantity: 1,
            },
        ],
        subscription_data: {
            trial_period_days: 7,
        },
        success_url: `${process.env.BASE_URL}/app?subscription_success=true`,
        cancel_url:
            `${process.env.BASE_URL}/app/settings/establishments?cancel=true`,
        metadata: {
            userId: user.id,
            establishmentId,
        },
    });

    return { url: session.url };
});

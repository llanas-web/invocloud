import type Stripe from "stripe";
import { StripeHandlerContext } from "~~/server/lib/stripe/context";
import { sessionMetadataSchema } from "~~/server/lib/stripe/schema";
import { sendEmail } from "~~/server/lib/email";
import { fromUnix, nowISO } from "~/utils/date";

import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import createEstablishmentRepository from "~~/shared/repositories/establishment.repository";

const getSubscriptionId = (session: Stripe.Checkout.Session) => {
    const { subscription } = session;
    if (!subscription) {
        console.error("❌ No subscription found in session");
        return null;
    }
    if (typeof subscription === "string") {
        return subscription;
    } else if (subscription.id && typeof subscription.id === "object") {
        return subscription.id;
    }
    return null;
};

const getCustomerId = (customer: Stripe.Checkout.Session["customer"]) => {
    if (typeof customer === "string") {
        return customer;
    } else if (customer && typeof customer === "object" && customer.id) {
        return customer.id;
    }
    return null;
};

const retrieveSubscription = async (
    ctx: StripeHandlerContext,
    subscriptionId: string,
) => {
    try {
        return await ctx.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
        console.error("❌ Failed to retrieve subscription:", error);
        return null;
    }
};

export async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    ctx: StripeHandlerContext,
) {
    const subscriptionId = getSubscriptionId(session);
    const customerId = getCustomerId(session.customer);
    const establishmentRepository = createEstablishmentRepository(
        ctx.supabase,
    );
    if (!subscriptionId || !customerId) {
        console.error("❌ Missing subscription or customer ID");
        return;
    }

    // ✅ Validate metadata
    const parseResult = sessionMetadataSchema.safeParse(session.metadata);
    if (!parseResult.success) {
        console.error(
            "❌ Invalid session metadata:",
            parseResult.error.format(),
        );
        return;
    }
    const { userId, establishmentId } = parseResult.data;

    const subscription = await retrieveSubscription(ctx, subscriptionId);
    if (!subscription) {
        console.error("❌ Subscription not found");
        return;
    }

    const subscriptionStatus = subscription.status === "trialing"
        ? "trialing"
        : "active";

    const { error } = await establishmentRepository.updateEstablishment(
        establishmentId,
        {
            subscription_status: subscriptionStatus,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_start: nowISO(),
            trial_end: fromUnix(subscription.trial_end),
        },
    );

    if (error) {
        console.error("❌ Failed to update establishment:", error);
    } else {
        console.log(
            `✅ Checkout session completed for ${establishmentId}. Checkout status: ${subscriptionStatus}`,
        );

        const { data: user, error } = await ctx.supabase.from("users").select(
            "email",
        )
            .eq("id", userId).single();
        if (!user || error) {
            console.error("❌ No user email found");
            return;
        }
        await sendEmail(
            [user.email],
            "Confirmation abonnement Invocloud",
            `Bonjour,<br><br>` +
                `<p>Merci pour votre abonnement à Invocloud ! Votre essai gratuit de 7 jours a commencé. Vous pouvez dès à présent profiter de toutes les fonctionnalités premium.</p>` +
                `<p>Votre abonnement commencera le ${
                    format(
                        fromUnix(subscription.trial_end)!,
                        "dd/MM/yyyy",
                        {
                            locale: fr,
                        },
                    )
                }</p><br><br>` +
                `<p>Si vous avez des questions, n'hésitez pas à nous contacter: <a href="mailto:contact@invocloud.fr">contact@invocloud.fr</a></p><br>` +
                `<p>L'équipe InvoCloud</p>`,
        );
    }
}

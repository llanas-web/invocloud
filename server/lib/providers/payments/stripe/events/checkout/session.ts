import type Stripe from "stripe";
import { fromUnix, nowISO } from "~/utils/date";

import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Deps } from "~~/server/core/types";
import { sessionMetadataSchema } from "~~/server/lib/providers/payments/stripe/schema";
import { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";

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

export async function handleCheckoutSessionCompleted(
    stripe: Stripe,
    session: Stripe.Checkout.Session,
    deps: Deps,
) {
    const subscriptionId = getSubscriptionId(session);
    const customerId = getCustomerId(session.customer);
    const {
        database: { subscriptionRepository, userRepository },
        email: emailRepository,
    } = deps;
    if (!subscriptionId || !customerId) {
        console.error("❌ Missing subscription or customer ID");
        return;
    }

    // ✅ Validate metadata
    const { establishmentId } = sessionMetadataSchema.parse(
        session.metadata,
    );

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionStatus = subscription.status === "trialing"
        ? SubscriptionStatus.TRIAL
        : SubscriptionStatus.ACTIVE;

    await subscriptionRepository.createSubscription(
        {
            provider: "stripe",
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            started_at: nowISO(),
            end_at: fromUnix(subscription.trial_end) ?? null,
            establishment_id: establishmentId,
            status: subscriptionStatus,
        },
    );

    const { email } = await userRepository.getUser({
        id: session.customer_email!,
    });

    await emailRepository.sendEmail({
        to: [email],
        subject: "Confirmation abonnement Invocloud",
        html: `Bonjour,<br><br>` +
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
    });
}

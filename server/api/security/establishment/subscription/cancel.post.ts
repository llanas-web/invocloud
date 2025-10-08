// server/api/stripe/cancel-subscription.ts
import { defineEventHandler } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~~/types/database.types";
import { stripe } from "~~/server/lib/stripe/client";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

export default defineEventHandler(async (event) => {
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseClient,
    );
    const { establishmentId } = await readBody(event);

    const { data: establishments } = await establishmentRepository
        .getEstablishmentsByIds([establishmentId], true);
    if (!establishments || establishments.length === 0) {
        return { error: "Établissement non trouvé" };
    }
    const establishment = establishments[0];

    if (!establishment.stripe_subscription_id) {
        return { error: "Aucun abonnement actif trouvé" };
    }

    // Cancel subscription at period end
    if (establishment.subscription_status === "trialing") {
        await stripe.subscriptions.cancel(establishment.stripe_subscription_id);
    } else {
        await stripe.subscriptions.update(
            establishment.stripe_subscription_id,
            {
                cancel_at_period_end: true,
            },
        );
    }

    return {
        success: true,
    };
});

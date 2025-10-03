// server/api/stripe/cancel-trial.ts
import { stripe } from "~~/server/lib/stripe/client";
import { defineEventHandler } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~~/types/database.types";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

export default defineEventHandler(async (event) => {
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseClient,
    );
    const user = await serverSupabaseUser(event);
    if (!user) {
        return { error: "Not authenticated" };
    }

    const { establishmentId } = await readBody(event);

    const { data: establishments } = await establishmentRepository
        .getEstablishmentsByIds([establishmentId], true);
    if (!establishments || establishments.length === 0) {
        return { error: "Établissement non trouvé" };
    }
    const establishment = establishments[0];

    if (!establishment?.stripe_subscription_id) {
        return { error: "Aucun abonnement actif trouvé" };
    }

    // Immediately cancel the subscription (trial or not)
    await stripe.subscriptions.cancel(establishment.stripe_subscription_id);

    // Update DB
    await establishmentRepository.updateEstablishment(establishmentId, {
        subscription_status: "canceled",
        subscription_end: new Date().toISOString(),
    });

    return {
        success: true,
        message: "L'essai ou l'abonnement a été annulé immédiatement.",
    };
});

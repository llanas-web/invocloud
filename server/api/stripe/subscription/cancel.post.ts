// server/api/stripe/cancel-subscription.ts
import { defineEventHandler } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~~/types/database.types";
import { stripe } from "~~/server/lib/stripe/client";

export default defineEventHandler(async (event) => {
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const { establishmentId } = await readBody(event);

    // Get user's structure
    const { data: structure } = await supabaseClient
        .from("establishments")
        .select("stripe_subscription_id")
        .eq("id", establishmentId)
        .single();

    if (!structure?.stripe_subscription_id) {
        return { error: "Aucun abonnement actif trouvé" };
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(structure.stripe_subscription_id, {
        cancel_at_period_end: true,
    });

    return {
        success: true,
        message: "L'abonnement sera annulé à la fin de la période.",
    };
});

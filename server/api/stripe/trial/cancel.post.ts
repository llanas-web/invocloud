// server/api/stripe/cancel-trial.ts
import { stripe } from "@/server/lib/stripe/client";
import { defineEventHandler } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    if (!user) {
        return { error: "Not authenticated" };
    }

    const { establishmentId } = await readBody(event);

    const { data: structure } = await supabaseClient
        .from("establishments")
        .select("stripe_subscription_id")
        .eq("id", establishmentId)
        .single();

    if (!structure?.stripe_subscription_id) {
        return { error: "Aucun abonnement actif trouvé" };
    }

    // Immediately cancel the subscription (trial or not)
    await stripe.subscriptions.cancel(structure.stripe_subscription_id);

    // Update DB
    await supabaseClient
        .from("establishments")
        .update({
            subscription_status: "canceled",
            subscription_end: new Date().toISOString(),
        })
        .eq("id", establishmentId);

    return {
        success: true,
        message: "L'essai ou l'abonnement a été annulé immédiatement.",
    };
});

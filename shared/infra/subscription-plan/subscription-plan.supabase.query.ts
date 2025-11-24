import type { SubscriptionPlanQuery } from "~~/shared/application/subscription-plan/subscription-plan.query";
import { SupabaseError } from "../common/supabase/supabase.error";
import type { SubscriptionPlanDTO } from "~~/shared/application/subscription-plan/dto/subscription-plan.dto";
import type { Database } from "../common/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SubscriptionPlanSupabaseQuery implements SubscriptionPlanQuery {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getSubscriptionPlanByName(
        planName: string,
    ): Promise<SubscriptionPlanDTO | null> {
        const { data, error } = await this.supabase
            .from("subscription_plans")
            .select("*")
            .eq("name", planName)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) return null;

        return {
            id: data.id,
            createdAt: new Date(data.created_at),
            name: data.name,
            providerProductId: data.provider_product_id,
            includedInvoicesPerMonth: data.included_invoices,
            pricePerMonthCents: data.price,
            maxEstablishments: data.max_establishments,
            maxMembers: data.max_members,
            subscriptionPriceId: data.subscription_price_id,
            metricPriceId: data.metric_price_id,
        };
    }
}

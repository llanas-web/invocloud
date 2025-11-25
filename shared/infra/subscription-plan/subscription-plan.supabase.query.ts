import type { SubscriptionPlanQuery } from "~~/shared/application/subscription-plan/subscription-plan.query";
import { SupabaseError } from "../common/supabase/supabase.error";
import type { SubscriptionPlanDTO } from "~~/shared/application/subscription-plan/dto/subscription-plan.dto";
import type { Database } from "../common/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const subscriptionMapper = (item: any): SubscriptionPlanDTO => ({
    id: item.id,
    createdAt: new Date(item.created_at),
    name: item.name,
    providerProductId: item.provider_product_id,
    includedInvoicesPerMonth: item.included_invoices,
    pricePerMonthCents: item.price,
    maxEstablishments: item.max_establishments,
    maxMembers: item.max_members,
    subscriptionPriceId: item.subscription_price_id,
    metricPriceId: item.metric_price_id,
    hasOcrFeature: item.has_ocr_feature,
    hasInboundFeature: item.has_inbound_feature,
});

export class SubscriptionPlanSupabaseQuery implements SubscriptionPlanQuery {
    constructor(private supabase: SupabaseClient<Database>) {}

    async listAll(): Promise<SubscriptionPlanDTO[]> {
        const { data, error } = await this.supabase
            .from("subscription_plans")
            .select("*");
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) return [];

        return data.map(subscriptionMapper);
    }

    async getById(id: string): Promise<SubscriptionPlanDTO | null> {
        const { data, error } = await this.supabase
            .from("subscription_plans")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) return null;

        return subscriptionMapper(data);
    }

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

        return subscriptionMapper(data);
    }
}

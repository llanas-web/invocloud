import type { SubscriptionModel } from "~~/shared/types/models/subscription.model";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../supabase-error";
import type {
    SubscriptionInsert,
    SubscriptionUpdate,
} from "~~/shared/types/providers/database";
import { subscriptionMapperFromDatabase } from "../mapper/subscription.mapper";
import type { SubscriptionRepository } from "../../database.interface";

export class SubscriptionSupabaseRepository implements SubscriptionRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getSubscriptionById(
        id: string,
    ) {
        const { data, error } = await this.supabase
            .from("subscriptions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw SupabaseError.fromPostgrest(error);
        return subscriptionMapperFromDatabase(data);
    }

    async getSubscriptionByCustomerId(
        customerId: string,
    ) {
        const { data, error } = await this.supabase
            .from("subscriptions")
            .select("*")
            .eq("customer_id", customerId)
            .single();

        if (error) throw SupabaseError.fromPostgrest(error);
        return subscriptionMapperFromDatabase(data);
    }

    async createSubscription(
        subscription: SubscriptionInsert,
    ) {
        const { data, error } = await this.supabase
            .from("subscriptions")
            .insert(subscription)
            .select("*")
            .single();

        if (error) throw SupabaseError.fromPostgrest(error);
        return subscriptionMapperFromDatabase(data);
    }

    async updateSubscription(
        id: string,
        updates: SubscriptionUpdate,
    ) {
        const { data, error } = await this.supabase
            .from("subscriptions")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single();

        if (error) throw SupabaseError.fromPostgrest(error);
        return subscriptionMapperFromDatabase(data);
    }
}

import type { UserRepository } from "~~/shared/domain/user/user.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type DraftUser, UserModel } from "~~/shared/domain/user/user.model";
import { SupabaseError } from "../../common/supabase/supabase.error";
import type { Database } from "../../common/supabase/database.types";
import UserSettingsEntity from "~~/shared/domain/user/user-settings.entity";
import SubscriptionEntity, {
    SubscriptionStatus,
} from "~~/shared/domain/user/subscription.entity";

export class UserSupabaseRepository implements UserRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getById(id: string): Promise<UserModel | null> {
        const { data, error } = await this.supabase
            .from("users")
            .select(
                "*, user_settings(*), subscriptions(*, subscription_plans(id))",
            )
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) return null;

        let userSettings: UserSettingsEntity | null = null;
        if (data.user_settings) {
            userSettings = UserSettingsEntity.create({
                favoriteEstablishmentId:
                    data.user_settings.favorite_establishment_id,
            });
        }

        let userSubscription: SubscriptionEntity | null = null;
        if (data.subscriptions) {
            const _subStatus = data.subscriptions.status === "active"
                ? SubscriptionStatus.ACTIVE
                : SubscriptionStatus.CANCELED;
            userSubscription = SubscriptionEntity.create({
                createdAt: new Date(data.subscriptions.created_at),
                status: _subStatus,
                startAt: new Date(data.subscriptions.started_at),
                endAt: data.subscriptions.end_at
                    ? new Date(data.subscriptions.end_at)
                    : null,
                providerSubscriptionId:
                    data.subscriptions.provider_subscription_id,
                providerCustomerId: data.subscriptions.provider_customer_id,
                planId: data.subscriptions.subscription_plans.id,
            });
        }

        return UserModel.create({
            id: data.id,
            email: data.email,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            fullName: data.full_name,
            settings: userSettings,
            subscription: userSubscription,
        });
    }

    async create(entity: DraftUser): Promise<string> {
        const { data, error } = await this.supabase
            .from("users")
            .insert({
                email: entity.email,
                full_name: entity.fullName,
            })
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.id;
    }

    async update(entity: UserModel): Promise<void> {
        const { error } = await this.supabase
            .from("users")
            .update({
                email: entity.email,
                full_name: entity.fullName,
            })
            .eq("id", entity.id);

        if (error) throw SupabaseError.fromPostgrest(error);

        this.syncSettings(entity.id, entity.settings);
        this.syncSubscription(entity.id, entity.subscription);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("users")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    private async syncSettings(
        id: string,
        settings: UserSettingsEntity | null,
    ): Promise<void> {
        if (!settings) {
            await this.supabase
                .from("user_settings")
                .delete()
                .eq("user_id", id);
            return;
        }
        await this.supabase
            .from("user_settings")
            .upsert({
                user_id: id,
                favorite_establishment_id: settings.favoriteEstablishmentId,
            });
    }

    private async syncSubscription(
        id: string,
        subscription: SubscriptionEntity | null,
    ): Promise<void> {
        console.log("Syncing subscription for user:", id);
        console.log("Subscription data:", subscription);

        if (!subscription) {
            await this.supabase
                .from("subscriptions")
                .delete()
                .eq("user_id", id);
            return;
        }

        await this.supabase
            .from("subscriptions")
            .upsert([{
                user_id: id,
                provider_customer_id: subscription.providerCustomerId ?? "",
                provider_subscription_id: subscription.providerSubscriptionId ??
                    "",
                started_at: subscription.startAt.toISOString(),
                status: subscription.status === SubscriptionStatus.ACTIVE
                    ? "active"
                    : "canceled",
                end_at: subscription.endAt?.toISOString() ?? null,
                subscription_plan_id: subscription.planId,
            }], {
                onConflict: "user_id",
                ignoreDuplicates: false,
            });
    }
}

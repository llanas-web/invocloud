import {
    type DraftEstablishment,
    EstablishmentModel,
} from "~~/shared/domain/establishment/establishment.model";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import MemberEntity, {
    MemberRole,
} from "~~/shared/domain/establishment/member.entity";
import { SupabaseError } from "../../common/supabase/supabase.error";
import SubscriptionEntity, {
    SubscriptionStatus,
} from "~~/shared/domain/establishment/subscription.entity";
import type { Database } from "../../common/supabase/database.types";

export class EstablishmentSupabaseRepository
    implements EstablishmentRepository {
    constructor(private supabaseClient: SupabaseClient<Database>) {}

    async getById(id: string): Promise<EstablishmentModel | null> {
        const { data, error } = await this.supabaseClient
            .from("establishments")
            .select(`
                *,
                establishment_members(
                    user_id,
                    role,
                    status,
                    created_at,
                    users(
                        id
                    )
                ),
                subscription:subscriptions(*)
            `)
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw SupabaseError.fromPostgrest(error);
        }
        const members = (data.establishment_members ?? []).map((em: any) =>
            MemberEntity.create({
                userId: em.user_id,
                role: em.role,
                status: em.status,
            })
        );

        let subscription: SubscriptionEntity | null = null;
        if (data.subscription !== null) {
            subscription = SubscriptionEntity.create({
                status: data.subscription.status as SubscriptionStatus,
                createdAt: new Date(data.subscription.created_at),
                providerCustomerId: data.subscription.provider_customer_id ||
                    null,
                providerSubscriptionId:
                    data.subscription.provider_subscription_id || null,
                startAt: new Date(data.subscription.started_at),
                endAt: data.subscription.end_at
                    ? new Date(data.subscription.end_at)
                    : null,
            });
        }

        return EstablishmentModel.create({
            id: data.id,
            creatorId: data.creator_id,
            name: data.name,
            emailPrefix: data.email_prefix,
            address: data.address,
            phone: data.phone,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            members,
            subscription,
        });
    }

    async create(entity: DraftEstablishment): Promise<string> {
        const { data, error } = await this.supabaseClient
            .from("establishments")
            .insert({
                creator_id: entity.creatorId,
                name: entity.name,
                email_prefix: entity.emailPrefix,
                address: entity.address,
                phone: entity.phone,
            })
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.id;
    }

    async update(entity: EstablishmentModel): Promise<void> {
        // 1. Mettre à jour l'établissement
        const { error: estabError } = await this.supabaseClient
            .from("establishments")
            .update({
                creator_id: entity.creatorId,
                name: entity.name,
                email_prefix: entity.emailPrefix,
                address: entity.address,
                phone: entity.phone,
            })
            .eq("id", entity.id);

        if (estabError) {
            throw SupabaseError.fromPostgrest(estabError);
        }

        // 2. Synchroniser les membres de manière différentielle
        await this.syncMembers(entity.id, entity.members);

        // 3. Mettre à jour l'abonnement si nécessaire
        await this.syncSubscription(entity.id, entity.subscription);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabaseClient
            .from("establishments")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async deleteMany(establishmentIds: string[]): Promise<void> {
        const { error } = await this.supabaseClient
            .from("establishments")
            .delete()
            .in("id", establishmentIds);

        if (error) {
            console.error("Error deleting establishments:", error);
            throw SupabaseError.fromPostgrest(error);
        }
    }

    private async syncMembers(
        establishmentId: string,
        newMembers: MemberEntity[],
    ): Promise<void> {
        // Récupérer les user_ids actuels pour identifier les suppressions
        const { data: currentMembers } = await this.supabaseClient
            .from("establishment_members")
            .select("user_id")
            .eq("establishment_id", establishmentId);

        const currentUserIds = new Set(
            currentMembers?.map((m) => m.user_id) ?? [],
        );
        const newUserIds = new Set(newMembers.map((m) => m.userId));

        // Supprimer les membres qui ne sont plus présents
        const membersToDelete = [...currentUserIds].filter((id) =>
            !newUserIds.has(id)
        );
        if (membersToDelete.length > 0) {
            await this.supabaseClient
                .from("establishment_members")
                .delete()
                .eq("establishment_id", establishmentId)
                .in("user_id", membersToDelete);
        }

        // Upsert les membres (insère ou met à jour)
        if (newMembers.length > 0) {
            await this.supabaseClient
                .from("establishment_members")
                .upsert(
                    newMembers.map((m) => ({
                        establishment_id: establishmentId,
                        user_id: m.userId,
                        role: MemberRole.ADMIN,
                        status: m.status,
                    })),
                    {
                        onConflict: "establishment_id,user_id",
                        ignoreDuplicates: false, // Met à jour si existe déjà
                    },
                );
        }
    }

    private async syncSubscription(
        establishmentId: string,
        subscription: SubscriptionEntity | null,
    ): Promise<void> {
        if (!subscription) {
            // Supprimer l'abonnement s'il n'existe pas dans le modèle
            await this.supabaseClient
                .from("subscriptions")
                .delete()
                .eq("establishment_id", establishmentId);
            return;
        }

        // Mettre à jour ou insérer l'abonnement
        await this.supabaseClient
            .from("subscriptions")
            .upsert([{
                establishment_id: establishmentId,
                status: subscription.status,
                provider_customer_id: subscription.providerCustomerId ?? "",
                provider_subscription_id: subscription.providerSubscriptionId ??
                    "",
                started_at: subscription.startAt.toISOString(),
                end_at: subscription.endAt?.toISOString() ?? null,
                provider: "stripe",
            }], {
                onConflict: "establishment_id",
                ignoreDuplicates: false,
            });
    }
}

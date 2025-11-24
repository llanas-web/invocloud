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
                )
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
}

import {
    type DraftEstablishment,
    EstablishmentModel,
} from "~~/shared/domain/establishment/establishment.model";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { MemberEntity } from "~~/shared/domain/establishment/member.entity";
import { SupabaseError } from "../../common/errors/supabase.error";

type Row = Database["public"]["Tables"]["establishments"]["Row"];
type Upsert =
    | Database["public"]["Tables"]["establishments"]["Insert"]
    | Database["public"]["Tables"]["establishments"]["Update"];

const fromRow = (row: any): EstablishmentModel => {
    const members = (row.establishment_members ?? []).map((em: any) =>
        MemberEntity.create({
            userId: em.user_id,
            role: em.role,
            status: em.status,
        })
    );

    return EstablishmentModel.create({
        id: row.id,
        creatorId: row.creator_id,
        name: row.name,
        emailPrefix: row.email_prefix,
        address: row.address,
        phone: row.phone,
        members,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    });
};

const toUpsert = (
    entity: DraftEstablishment | EstablishmentModel,
): Upsert => ({
    creator_id: entity.creatorId,
    name: entity.name,
    email_prefix: entity.emailPrefix,
    address: entity.address,
    phone: entity.phone,
});

export class EstablishmentSupabaseRepository
    implements EstablishmentRepository {
    constructor(private supabaseClient: SupabaseClient) {}

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
                        id,
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw SupabaseError.fromPostgrest(error);
        }

        return fromRow(data);
    }

    async create(entity: DraftEstablishment): Promise<EstablishmentModel> {
        const insertData = toUpsert(entity);
        const { data, error } = await this.supabaseClient
            .from("establishments")
            .insert(insertData)
            .select("*")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async update(entity: EstablishmentModel): Promise<EstablishmentModel> {
        const payload = toUpsert(entity);

        // 1. Mettre à jour l'établissement
        const { data: estabData, error: estabError } = await this.supabaseClient
            .from("establishments")
            .update(payload)
            .eq("id", entity.id)
            .select("*")
            .single();

        if (estabError) {
            console.error("Error updating establishment:", estabError);
            throw SupabaseError.fromPostgrest(estabError);
        }

        // 2. Synchroniser les membres de manière différentielle
        await this.syncMembers(entity.id, entity.members);

        // 3. Recharger l'établissement avec ses membres
        return this.getById(entity.id) as Promise<EstablishmentModel>;
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
                        role: m.role,
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

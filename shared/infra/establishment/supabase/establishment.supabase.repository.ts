import {
    type DraftEstablishment,
    type EstablishmentImmutableProps,
    EstablishmentModel,
    type EstablishmentMutableProps,
} from "~~/shared/domain/establishment/establishment.model";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../common/errors/supabase.error";

type Row = Database["public"]["Tables"]["establishments"]["Row"];
type Upsert =
    | Database["public"]["Tables"]["establishments"]["Insert"]
    | Database["public"]["Tables"]["establishments"]["Update"];

const fromRow = (row: Row): EstablishmentModel =>
    EstablishmentModel.create({
        id: row.id,
        creatorId: row.creator_id,
        name: row.name,
        emailPrefix: row.email_prefix,
        address: row.address,
        phone: row.phone,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    });

const toUpsert = (
    entity: DraftEstablishment,
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
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async create(entity: DraftEstablishment): Promise<EstablishmentModel> {
        const insertData = toUpsert(entity);
        const { data, error } = await this.supabaseClient
            .from("establishments")
            .insert(insertData)
            .select("*")
            .single();
        if (error) SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async update(entity: EstablishmentModel): Promise<EstablishmentModel> {
        const payload = toUpsert(entity);

        const { data, error } = await this.supabaseClient
            .from("establishments")
            .update(payload)
            .eq("id", entity.id)
            .select("*")
            .single();
        if (error) {
            console.error("Error updating establishment:", error);
            throw new Error("Failed to update establishment");
        }

        return fromRow(data);
    }

    async deleteMany(establishmentIds: string[]): Promise<void> {
        const { error } = await this.supabaseClient
            .from("establishments")
            .delete()
            .in("id", establishmentIds);

        if (error) {
            console.error("Error deleting establishments:", error);
            throw new Error("Failed to delete establishments");
        }
    }
}

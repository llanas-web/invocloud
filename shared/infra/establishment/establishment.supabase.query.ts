import type {
    EstablishmentListFilter,
    EstablishmentListItemDTO,
    EstablishmentListQuery,
} from "~~/shared/application/establishment/queries/establishment-list.query";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../common/errors/supabase.error";

type Row = Database["public"]["Tables"]["establishments"]["Row"];

const fromRow = (row: Row): EstablishmentListItemDTO => ({
    id: row.id,
    name: row.name,
    emailPrefix: row.email_prefix,
    creatorId: row.creator_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    address: row.address,
    phone: row.phone,
});

export class EstablishmentSupabaseQuery implements EstablishmentListQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async execute(
        filter?: EstablishmentListFilter,
    ): Promise<EstablishmentListItemDTO[]> {
        const req = this.supabase
            .from("establishments")
            .select("*")
            .order("created_at", { ascending: false });

        if (filter?.memberIds && filter.memberIds.length > 0) {
            req.in("creator_id", filter.memberIds);
        }

        const { data, error } = await req;
        if (error) SupabaseError.fromPostgrest(error);
        return (data as Row[]).map(fromRow);
    }
}

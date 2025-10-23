import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../common/errors/supabase.error";
import type {
    EstablishmentListItemDTO,
} from "~~/shared/application/establishment/dto";
import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";
import type { ListEstablishmentQueryFilter } from "~~/shared/application/establishment/queries";

export class EstablishmentSupabaseQuery implements EstablishmentQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listEstablishments(
        filter?: ListEstablishmentQueryFilter,
    ): Promise<EstablishmentListItemDTO[]> {
        const req = this.supabase
            .from("establishments")
            .select(
                "id, name, creator_id, created_at, email_prefix, updated_at",
            )
            .order("created_at", { ascending: false });

        if (filter?.memberIds && filter.memberIds.length > 0) {
            req.in("creator_id", filter.memberIds);
        }

        const { data, error } = await req;
        if (error) SupabaseError.fromPostgrest(error);
        return data!.map((row) => ({
            id: row.id,
            name: row.name,
            creatorId: row.creator_id,
            emailPrefix: row.email_prefix,
            updatedAt: fromStringToLocalDate(row.updated_at),
            createdAt: fromStringToLocalDate(row.created_at),
        }));
    }

    async isEmailPrefixAvailable(
        emailPrefix: string,
        excludeId?: string | null,
    ): Promise<boolean> {
        let req = this.supabase
            .from("establishments")
            .select("id")
            .eq("email_prefix", emailPrefix);
        if (excludeId) {
            req = req.neq("id", excludeId);
        }
        const { data, error } = await req;
        if (error) throw SupabaseError.fromPostgrest(error);
        return data!.length === 0;
    }

    async hasAnyByCreatorId(userId: string): Promise<boolean> {
        const { error, count } = await this.supabase
            .from("establishments")
            .select("id", { count: "exact", head: true })
            .eq("creator_id", userId);
        if (error) throw SupabaseError.fromPostgrest(error);
        return count != null && count > 0;
    }
}

import type {
    UserDetailsDTO,
    UserListItemDTO,
} from "~~/shared/application/user/dto";
import type { ListUserQueryFilter } from "~~/shared/application/user/queries";
import type { UserQuery } from "~~/shared/application/user/user.query";
import { SupabaseError } from "../../common/errors/supabase.error";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../common/supabase/database.types";

export class UserSupabaseQuery implements UserQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listUsers(
        filters?: ListUserQueryFilter,
    ): Promise<UserListItemDTO[]> {
        const req = this.supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });
        if (filters?.ids) {
            req.in("id", filters.ids);
        }
        if (filters?.emails) {
            req.in("email", filters.emails);
        }
        const { data, error } = await req;
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.map((row) => ({
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            createdAt: fromStringToLocalDate(row.created_at),
            updatedAt: fromStringToLocalDate(row.updated_at),
        }));
    }

    async getUserDetails(id: string): Promise<UserDetailsDTO | null> {
        const { data, error } = await this.supabase
            .from("users")
            .select("*, user_settings(*)")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            createdAt: fromStringToLocalDate(data.created_at),
            updatedAt: fromStringToLocalDate(data.updated_at),
            favoriteEstablishmentId: data.user_settings
                ?.favorite_establishment_id ?? null,
        };
    }
}

import type { UserListItemDTO } from "~~/shared/application/user/dto";
import type { ListUserQueryFilter } from "~~/shared/application/user/queries";
import type { UserQuery } from "~~/shared/application/user/user.query";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseError } from "../../common/errors/supabase.error";
import type { SupabaseClient } from "@supabase/supabase-js";

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
}

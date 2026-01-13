import type { AdminRepository } from "~~/shared/application/common/providers/auth/admin.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~~/shared/infra/common/supabase/database.types";
import { SupabaseError } from "~~/shared/infra/common/supabase/supabase.error";

export default class AdminSupabaseRepository implements AdminRepository {
    constructor(private supabaseClient: SupabaseClient<Database>) {}

    async inviteUser(email: string, options: {
        establishmentId: string;
        invitorId: string;
        redirection: string;
    }) {
        const { data, error } = await this.supabaseClient.auth.admin
            .inviteUserByEmail(email, {
                data: {
                    establishment_id: options.establishmentId,
                    invitor_id: options.invitorId,
                },
                redirectTo: options.redirection,
            });
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.user.id;
    }

    async updateUser(userId: string, updates: {
        password?: string;
    }): Promise<void> {
        const { error } = await this.supabaseClient.auth.admin.updateUserById(
            userId,
            {
                password: updates.password,
            },
        );
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async deleteUser(userId: string): Promise<void> {
        const { error } = await this.supabaseClient.auth.admin.deleteUser(
            userId,
        );
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

import type { AdminRepository } from "../../database.interface";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../supabase-error";
import { Err, Ok } from "../../result";

export class AdminSupabaseRepository implements AdminRepository {
    constructor(private supabaseClient: SupabaseClient) {}

    async inviteUserByEmail(
        email: string,
        data: object = {},
        redirectTo: string = "",
    ) {
        const { error } = await this.supabaseClient.auth.admin
            .inviteUserByEmail(
                email,
                {
                    data,
                    redirectTo,
                },
            );
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(true);
    }
}

export default AdminSupabaseRepository;

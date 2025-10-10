import DatabaseError from "../../database-error";
import type { AdminInterface } from "../../database.interface";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AdminRepository implements AdminInterface {
    constructor(private supabaseClient: SupabaseClient) {}

    async inviteUserByEmail(
        email: string,
        data: object = {},
        redirectTo: string = "",
    ): Promise<boolean> {
        const { error } = await this.supabaseClient.auth.admin
            .inviteUserByEmail(
                email,
                {
                    data,
                    redirectTo,
                },
            );
        if (error) throw new DatabaseError("Error inviting user", error);
        return true;
    }
}

export default AdminRepository;

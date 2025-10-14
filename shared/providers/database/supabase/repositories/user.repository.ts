import type {
    UserSettingsUpdate,
    UserUpdate,
} from "~~/types/providers/database/index";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRepository } from "../../database.interface";
import { userMapperFromDatabase } from "../mapper";
import { userSettingsMapperFromDatabase } from "../mapper/user-settings.mapper";
import { Err, Ok } from "../../result";
import { SupabaseError } from "../supabase-error";

export class UserSupabaseRepository implements UserRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getUser(
        filter?: { id?: string; email?: string },
    ) {
        let request = this.supabase.from("users").select("*");

        if (filter?.id) request = request.eq("id", filter.id);
        if (filter?.email) request = request.eq("email", filter.email);

        const { data, error } = await request.maybeSingle();

        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(data ? userMapperFromDatabase(data) : null);
    }

    async updateUser(id: string, updates: UserUpdate) {
        const { data, error } = await this.supabase
            .from("users")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(userMapperFromDatabase(data));
    }

    async deleteUser(id: string) {
        const { error } = await this.supabase
            .from("users")
            .delete()
            .eq("id", id);
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(true);
    }

    async getUserSettings(userId: string) {
        const { data, error } = await this.supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(userSettingsMapperFromDatabase(data));
    }

    async upsertUserSettings(userId: string, settings: UserSettingsUpdate) {
        const { data, error } = await this.supabase
            .from("user_settings")
            .upsert({ user_id: userId, ...settings })
            .select()
            .single();
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(userSettingsMapperFromDatabase(data));
    }
}

import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRepository } from "../../database.interface";
import { userMapperFromDatabase } from "../mapper";
import { userSettingsMapperFromDatabase } from "../mapper/user-settings.mapper";
import { SupabaseError } from "../supabase-error";
import type { UserModelUpdate } from "~~/shared/types/models/user.model";
import { DomainError, DomainErrorCode } from "~~/shared/errors/domain.error";
import type { UserSettingsUpdate } from "~~/shared/types/providers/database";

export class UserSupabaseRepository implements UserRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getUser(
        filter?: { id?: string; email?: string },
    ) {
        let request = this.supabase.from("users").select("*");

        if (filter?.id) request = request.eq("id", filter.id);
        if (filter?.email) request = request.eq("email", filter.email);

        const { data, error } = await request.maybeSingle();

        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) {
            throw new DomainError(
                DomainErrorCode.UESR_NOT_FOUND,
                "Utilisateur non trouvé",
            );
        }
        return userMapperFromDatabase(data);
    }

    async updateUser(id: string, updates: UserModelUpdate) {
        const { data, error } = await this.supabase
            .from("users")
            .update({
                full_name: updates.fullName,
            })
            .eq("id", id)
            .select()
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return userMapperFromDatabase(data);
    }

    async deleteUser(id: string) {
        const { error } = await this.supabase
            .from("users")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
        return true;
    }

    async getUserSettings(userId: string) {
        const { data, error } = await this.supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return userSettingsMapperFromDatabase(data);
    }

    async upsertUserSettings(userId: string, settings: UserSettingsUpdate) {
        const { data, error } = await this.supabase
            .from("user_settings")
            .upsert({ user_id: userId, ...settings })
            .select()
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return userSettingsMapperFromDatabase(data);
    }
}

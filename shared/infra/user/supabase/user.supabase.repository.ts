import type { UserRepository } from "~~/shared/domain/user/user.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type DraftUser, UserModel } from "~~/shared/domain/user/user.model";
import { SupabaseError } from "../../common/errors/supabase.error";
import type { Database } from "../../common/supabase/database.types";
import UserSettingsEntity from "~~/shared/domain/user/user-settings.entity";

export class UserSupabaseRepository implements UserRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getById(id: string): Promise<UserModel | null> {
        const { data, error } = await this.supabase
            .from("users")
            .select("*, user_settings(*)")
            .eq("id", id)
            .single();
        if (error) {
            console.error("Error fetching user by ID:", error);
            return null;
        }

        let userSettings: UserSettingsEntity | null = null;
        if (data.user_settings) {
            userSettings = UserSettingsEntity.create({
                favoriteEstablishmentId:
                    data.user_settings.favorite_establishment_id,
            });
        }

        return UserModel.create({
            id: data.id,
            email: data.email,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            fullName: data.full_name,
            settings: userSettings,
        });
    }

    async create(entity: DraftUser): Promise<string> {
        const { data, error } = await this.supabase
            .from("users")
            .insert({
                email: entity.email,
                full_name: entity.fullName,
            })
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.id;
    }

    async update(entity: UserModel): Promise<void> {
        const { error } = await this.supabase
            .from("users")
            .update({
                email: entity.email,
                full_name: entity.fullName,
            })
            .eq("id", entity.id);

        if (error) throw SupabaseError.fromPostgrest(error);

        this.syncSettings(entity.id, entity.settings);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("users")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    private async syncSettings(
        id: string,
        settings: UserSettingsEntity | null,
    ): Promise<void> {
        if (!settings) {
            await this.supabase
                .from("user_settings")
                .delete()
                .eq("user_id", id);
            return;
        }
        await this.supabase
            .from("user_settings")
            .upsert({
                user_id: id,
                favorite_establishment_id: settings.favoriteEstablishmentId,
            });
    }
}

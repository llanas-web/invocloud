import type { UserRepository } from "~~/shared/domain/user/user.repository";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type DraftUser, UserModel } from "~~/shared/domain/user/user.model";
import { SupabaseError } from "../../common/errors/supabase.error";

export class UserSupabaseRepository implements UserRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getById(id: string): Promise<UserModel | null> {
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            console.error("Error fetching user by ID:", error);
            return null;
        }
        return UserModel.create({
            id: data.id,
            email: data.email,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            fullName: data.full_name,
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
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("users")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

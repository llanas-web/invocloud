import {
    type DraftSupplier,
    SupplierModel,
} from "~~/shared/domain/supplier/supplier.model";
import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../common/errors/supabase.error";
import type { Database } from "../../common/supabase/database.types";

export class SupplierSupabaseRepository implements SupplierRepository {
    constructor(private supabaseClient: SupabaseClient<Database>) {}

    async getById(id: string): Promise<SupplierModel | null> {
        const { data, error } = await this.supabaseClient
            .from("suppliers")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            console.error("Error fetching supplier by ID:", error);
            return null;
        }
        return SupplierModel.create({
            id: data.id,
            establishmentId: data.establishment_id,
            name: data.name,
            emails: data.emails,
            phone: data.phone,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        });
    }

    async create(entity: DraftSupplier): Promise<string> {
        const { data, error } = await this.supabaseClient
            .from("suppliers")
            .insert({
                establishment_id: entity.establishmentId,
                name: entity.name,
                emails: entity.emails,
                phone: entity.phone,
            })
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.id;
    }

    async update(entity: SupplierModel): Promise<void> {
        const { error } = await this.supabaseClient
            .from("suppliers")
            .update({
                name: entity.name,
                emails: entity.emails,
                phone: entity.phone,
            })
            .eq("id", entity.id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabaseClient
            .from("suppliers")
            .delete()
            .eq("id", id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async deleteMany(supplierIds: string[]): Promise<void> {
        const { error } = await this.supabaseClient
            .from("suppliers")
            .delete()
            .in("id", supplierIds);
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

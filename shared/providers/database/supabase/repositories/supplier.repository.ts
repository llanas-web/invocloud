import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    SupplierInsert,
    SupplierUpdate,
} from "~~/types/providers/database/index";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import type { SuppliersInterface } from "../../database.interface";
import SupabaseError from "../supabase-error";
import { supplierMapperFromDatabase } from "../mapper/supplier.mapper";

export default class SupplierRepository implements SuppliersInterface {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getAllSuppliers(
        filters?: { establishmentIds: string[]; emails: string[] },
    ) {
        const request = this.supabase.from("suppliers").select(`*
                    , establishment:establishments (
                        id,
                        name
                    )`);
        if (filters?.establishmentIds) {
            request.in("establishment_id", filters.establishmentIds);
        }
        if (filters?.emails) request.overlaps("emails", filters.emails);
        const { data, error } = await request.order("created_at", {
            ascending: false,
        });
        if (error) {
            throw new SupabaseError("Error fetching suppliers:", error);
        }
        return data.map(supplierMapperFromDatabase);
    }

    async createSupplier(supplier: SupplierInsert) {
        const { data, error } = await this.supabase
            .from("suppliers")
            .insert([supplier])
            .select(`*
                    , establishment:establishments (
                        id,
                        name
                    )`)
            .single();
        if (error) {
            throw new SupabaseError("Error creating supplier:", error);
        }
        return supplierMapperFromDatabase(data);
    }

    async updateSupplier(supplierId: string, updatedSupplier: SupplierUpdate) {
        const { data, error } = await this.supabase
            .from("suppliers")
            .update(updatedSupplier)
            .eq("id", supplierId)
            .select(`*
                    , establishment:establishments (
                        id,
                        name
                    )`)
            .single();

        if (error) {
            throw new SupabaseError("Error updating supplier:", error);
        }

        return supplierMapperFromDatabase(data);
    }
    async deleteSupplier(supplierId: string) {
        const { error } = await this.supabase
            .from("suppliers")
            .delete()
            .eq("id", supplierId);
        if (error) {
            throw new SupabaseError("Error deleting supplier:", error);
        }
        return true;
    }
}

import type { SupplierListItemDTO } from "~~/shared/application/supplier/dto";
import type {
    SupplierListFilter,
    SupplierQuery,
} from "~~/shared/application/supplier/supplier.query";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseError } from "../common/errors/supabase.error";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupplierSupabaseQuery implements SupplierQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listSuppliers(
        filters?: SupplierListFilter,
    ): Promise<SupplierListItemDTO[]> {
        const req = this.supabase
            .from("suppliers")
            .select("*")
            .order("created_at", { ascending: false });

        if (filters?.establishmentIds) {
            req.in("establishment_id", filters.establishmentIds);
        }

        const { data, error } = await req;
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.map((row) => ({
            id: row.id,
            establishmentId: row.establishment_id,
            name: row.name,
            emails: row.emails,
            phone: row.phone,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        }));
    }
}

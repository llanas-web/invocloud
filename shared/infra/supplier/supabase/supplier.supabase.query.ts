import type { SupplierListItemDTO } from "~~/shared/application/supplier/dto";
import type {
    SupplierListFilter,
    SupplierQuery,
} from "~~/shared/application/supplier/supplier.query";
import { SupabaseError } from "../../common/errors/supabase.error";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../common/supabase/database.types";

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
        if (filters?.emails) {
            req.overlaps("emails", filters.emails);
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

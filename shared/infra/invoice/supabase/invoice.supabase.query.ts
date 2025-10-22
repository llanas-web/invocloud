import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { InvoiceQuery } from "~~/shared/application/invoice/invoice.query";
import { SupabaseError } from "~~/shared/infra/common/errors/supabase.error";
import type { InvoiceListItemDTO } from "~~/shared/application/invoice/dto";
import type { InvoiceListQuery } from "~~/shared/application/invoice/query";

type Row = Database["public"]["Tables"]["invoices"]["Row"] & {
    suppliers: { name: string };
};

const fromRow = (row: Row): InvoiceListItemDTO => ({
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.suppliers.name,
    status: row.status,
    source: row.source,
    filePath: row.file_path,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    name: row.name ?? null,
    number: row.invoice_number ?? null,
    amount: row.amount ?? null,
    emitDate: row.emit_date ? new Date(row.emit_date) : null,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    paidAt: row.paid_at ? new Date(row.paid_at) : null,
    comment: row.comment ?? null,
});

export class InvoiceSupabaseQuery implements InvoiceQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listInvoices(
        filters?: InvoiceListQuery,
    ): Promise<InvoiceListItemDTO[]> {
        const req = this.supabase
            .from("invoices")
            .select("*, suppliers(name)")
            .order("created_at", { ascending: false });

        if (filters?.ids) req.in("id", filters.ids);
        if (filters?.supplierIds) req.in("supplier_id", filters.supplierIds);
        if (filters?.establishmentIds) {
            req.in("establishment_id", filters.establishmentIds);
        }
        if (filters?.status) req.in("status", filters.status);
        if (filters?.dateFrom) {
            req.gte("created_at", filters.dateFrom.toISOString());
        }
        if (filters?.dateTo) {
            req.lte("created_at", filters.dateTo.toISOString());
        }
        if (filters?.search) req.ilike("name", `%${filters.search}%`);

        const { data, error } = await req;
        if (error) throw SupabaseError.fromPostgrest(error);
        return (data as Row[]).map(fromRow);
    }
}

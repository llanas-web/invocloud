import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceQuery } from "~~/shared/application/invoice/invoice.query";
import { SupabaseError } from "~~/shared/infra/common/supabase/supabase.error";
import type {
    InvoiceDetailsDTO,
    InvoiceListItemDTO,
} from "~~/shared/application/invoice/dto";
import type { InvoiceListQuery } from "~~/shared/application/invoice/query";
import type { Database } from "../../common/supabase/database.types";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

type Row = Database["public"]["Tables"]["invoices"]["Row"] & {
    suppliers: { name: string; establishment_id: string };
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
    establishmentId: row.suppliers.establishment_id,
    establishmentName: row.suppliers.name ?? null,
});

export default class InvoiceSupabaseQuery implements InvoiceQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listInvoices(
        filters?: InvoiceListQuery,
    ): Promise<InvoiceListItemDTO[]> {
        const req = this.supabase
            .from("invoices")
            .select("*, suppliers!inner(name, establishment_id)")
            .order("created_at", { ascending: false });

        if (filters?.overdue) {
            const nowIso = new Date().toISOString();
            req.lt("due_date", nowIso).is("paid_at", null);
        }
        if (filters?.ids) req.in("id", filters.ids);
        if (filters?.supplierIds) req.in("supplier_id", filters.supplierIds);
        if (filters?.establishmentIds) {
            req.in("suppliers.establishment_id", filters.establishmentIds);
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

    async getInvoiceDetails(id: string): Promise<InvoiceDetailsDTO | null> {
        const { data, error } = await this.supabase
            .from("invoices")
            .select("*, suppliers(name)")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data as Row) as InvoiceDetailsDTO | null;
    }

    async listUnmeasuredInvoices({
        limit,
    }: { limit?: number } = {
        limit: 200,
    }): Promise<InvoiceListItemDTO[]> {
        const { data, error } = await this.supabase
            .from("invoices")
            .select("*, suppliers!inner(name, establishment_id)")
            .eq("has_been_measured", false)
            .in(
                "status",
                [
                    InvoiceStatus.VALIDATED,
                    InvoiceStatus.PAID,
                    InvoiceStatus.ERROR,
                ],
            )
            .limit(limit ?? 200)
            .order("created_at", { ascending: false });
        if (error) throw SupabaseError.fromPostgrest(error);
        return (data as Row[]).map(fromRow);
    }

    async markInvoicesAsMeasured(invoiceIds: string[]): Promise<void> {
        const { error } = await this.supabase
            .from("invoices")
            .update({ has_been_measured: true })
            .in("id", invoiceIds);
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

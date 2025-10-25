import type {
    InvoiceRepository,
} from "~~/shared/domain/invoice/invoice.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../common/errors/supabase.error";
import {
    type DraftInvoice,
    InvoiceModel,
} from "~~/shared/domain/invoice/invoice.model";
import type { Database } from "../../common/supabase/database.types";

type Row = Database["public"]["Tables"]["invoices"]["Row"];
type Insert = Database["public"]["Tables"]["invoices"]["Insert"];
type Update = Database["public"]["Tables"]["invoices"]["Update"];

const fromRow = (row: Row): InvoiceModel =>
    InvoiceModel.create({
        id: row.id,
        name: row.name,
        createdAt: new Date(row.created_at),
        amount: row.amount,
        number: row.invoice_number,
        source: row.source,
        status: row.status,
        updatedAt: new Date(row.updated_at),
        paidAt: row.paid_at ? new Date(row.paid_at) : null,
        dueDate: row.due_date ? new Date(row.due_date) : null,
        filePath: row.file_path,
        comment: row.comment,
        supplierId: row.supplier_id,
    });

const toInsert = (entity: DraftInvoice): Insert => ({
    supplier_id: entity.supplierId,
    file_path: entity.filePath,
    source: entity.source,
    status: entity.status,
    invoice_number: entity.number,
    amount: entity.amount ?? undefined,
    paid_at: entity.paidAt?.toISOString() ?? null,
    due_date: entity.dueDate?.toISOString() ?? null,
    comment: entity.comment,
});

const toUpsert = (
    entity: InvoiceModel,
): Update => ({
    supplier_id: entity.supplierId,
    file_path: entity.filePath,
    source: entity.source,
    status: entity.status,
    invoice_number: entity.number,
    amount: entity.amount ?? undefined,
    paid_at: entity.paidAt?.toISOString() ?? null,
    due_date: entity.dueDate?.toISOString() ?? null,
    comment: entity.comment,
});

export class InvoiceSupabaseRepository implements InvoiceRepository {
    constructor(private supabaseClient: SupabaseClient<Database>) {}

    async getById(id: string): Promise<InvoiceModel | null> {
        const { data, error } = await this.supabaseClient
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async create(invoice: DraftInvoice): Promise<string> {
        const payload = toInsert(invoice);
        const { data, error } = await this.supabaseClient
            .from("invoices")
            .insert(payload)
            .select("id")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.id;
    }
    async update(entity: InvoiceModel): Promise<void> {
        const payload = toUpsert(entity);
        const { error } = await this.supabaseClient.from("invoices")
            .update(payload)
            .eq("id", entity.id);
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async deleteMany(invoiceIds: string[]): Promise<void> {
        const { error } = await this.supabaseClient
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

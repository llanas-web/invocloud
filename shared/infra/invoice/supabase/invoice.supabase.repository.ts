import {
    type DraftInvoice,
    InvoiceModel,
} from "~~/shared/domain/invoice/invoice.model";
import type {
    InvoiceRepository,
} from "~~/shared/domain/invoice/invoice.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseError } from "../../common/errors/supabase.error";

type Row = Database["public"]["Tables"]["invoices"]["Row"] & {
    suppliers: {
        name: string;
    };
};
type Upsert =
    | Database["public"]["Tables"]["invoices"]["Insert"]
    | Database["public"]["Tables"]["invoices"]["Update"];

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

const toUpsert = (entity: DraftInvoice): Upsert => ({
    supplier_id: entity.supplierId,
    file_path: entity.filePath,
    amount: entity.amount ?? undefined,
    invoice_number: entity.number,
    source: entity.source,
    status: entity.status,
    paid_at: entity.paidAt?.toISOString() ?? null,
    due_date: entity.dueDate?.toISOString() ?? null,
    comment: entity.comment,
});

export class InvoiceSupabaseRepository implements InvoiceRepository {
    constructor(private supabaseClient: SupabaseClient) {}

    async getById(id: string): Promise<InvoiceModel | null> {
        const { data, error } = await this.supabaseClient
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async create(invoice: DraftInvoice): Promise<InvoiceModel> {
        const payload = toUpsert(invoice);
        const { data, error } = await this.supabaseClient.from("invoices")
            .insert(payload).single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }
    async update(entity: InvoiceModel): Promise<InvoiceModel> {
        const payload = toUpsert(entity);
        const { data, error } = await this.supabaseClient.from("invoices")
            .update(payload)
            .eq("id", entity.id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return fromRow(data);
    }

    async save(entity: DraftInvoice): Promise<void> {
        const payload = toUpsert(entity);
        const { error } = await this.supabaseClient.from("invoices").upsert(
            payload,
        );
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async deleteInvoices(invoiceIds: string[]): Promise<void> {
        const { error } = await this.supabaseClient
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}

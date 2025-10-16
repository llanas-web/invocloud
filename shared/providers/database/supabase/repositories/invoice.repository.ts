import type { Database } from "~~/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    InvoiceInsert,
    InvoiceUpdate,
} from "~~/types/providers/database/index";
import type { InvoiceRepository } from "../../database.interface";
import { invoiceMapperFromDatabase } from "../mapper/invoice.mapper";
import { supplierMapperFromDatabase } from "../mapper/supplier.mapper";
import { SupabaseError } from "../supabase-error";
import { DomainError } from "~~/shared/errors/domain.error";
import type { InvoiceModelUpdate } from "~~/shared/models/invoice.model";

export class InvoiceSupabaseRepository implements InvoiceRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async getAllInvoices(
        filters?: { ids?: string[]; establishmentIds?: string[] },
    ) {
        const request = this.supabase
            .from("invoices")
            .select("*, supplier:suppliers(*)");
        if (filters?.ids) request.in("id", filters.ids);
        if (filters?.establishmentIds) {
            request.in("establishment_id", filters.establishmentIds);
        }
        const { data, error } = await request;
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data?.length) {
            throw new DomainError(
                "NO_INVOICE",
                "Aucune facture trouvée",
                { filters },
            );
        }
        return data.map((invoice) => {
            const supplierModel = supplierMapperFromDatabase(invoice.supplier);
            const newInvoice = invoiceMapperFromDatabase(
                invoice,
                supplierModel,
            );
            return newInvoice;
        });
    }

    async createInvoice(invoices: InvoiceInsert[]) {
        const { data, error } = await this.supabase
            .from("invoices")
            .insert(invoices)
            .select("*, supplier:suppliers(*)");
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data?.length) {
            throw new DomainError(
                "NO_INVOICE",
                "Aucune facture créée",
                { invoices },
            );
        }
        return data.map((invoice) => {
            const supplierModel = supplierMapperFromDatabase(invoice.supplier);
            return invoiceMapperFromDatabase(invoice, supplierModel);
        });
    }

    async updateInvoice(
        invoiceId: string,
        invoice: InvoiceModelUpdate,
    ) {
        const { data, error } = await this.supabase
            .from("invoices")
            .update(invoice)
            .eq("id", invoiceId)
            .select("*, supplier:suppliers(*)")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        return invoiceMapperFromDatabase(
            data,
            supplierMapperFromDatabase(data.supplier),
        );
    }

    async deleteInvoices(invoiceIds: string[]) {
        const { error } = await this.supabase
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (error) throw SupabaseError.fromPostgrest(error);
        return true;
    }
}

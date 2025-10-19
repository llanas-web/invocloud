import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { invoiceMapperFromDatabase } from "../mapper/invoice.mapper";
import { supplierMapperFromDatabase } from "../mapper/supplier.mapper";
import { SupabaseError } from "../supabase-error";
import { DomainError, DomainErrorCode } from "~~/shared/errors/domain.error";
import type {
    InvoiceInsert,
    InvoiceUpdate,
} from "~~/shared/types/providers/database";
import type { InvoiceRepository } from "~~/shared/providers/database/database.interface";

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
                DomainErrorCode.NO_INVOICE,
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

    async createInvoice(invoice: InvoiceInsert) {
        const { data, error } = await this.supabase
            .from("invoices")
            .insert(invoice)
            .select("*, supplier:suppliers(*)")
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        const supplierModel = supplierMapperFromDatabase(data.supplier);
        return invoiceMapperFromDatabase(data, supplierModel);
    }

    async updateInvoice(
        invoiceId: string,
        invoice: InvoiceUpdate,
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

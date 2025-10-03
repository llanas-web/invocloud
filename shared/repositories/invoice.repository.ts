import type { Database } from "~~/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceInsert, InvoiceUpdate } from "~~/types";

const createInvoiceRepository = (supabase: SupabaseClient<Database>) => {
    const getInvoicesByEstablishment = async (establishmentId: string) => {
        const response = await supabase
            .from("invoices_with_establishment")
            .select("*")
            .eq("establishment_id", establishmentId);
        if (response.error) {
            console.error("Error fetching invoices:", response.error);
        }
        return response;
    };

    const getInvoicesByIds = async (invoiceIds: string[]) => {
        const response = await supabase
            .from("invoices")
            .select(`*,
                    supplier:suppliers(id, name)
                `)
            .in("id", invoiceIds);
        if (response.error) {
            console.error("Error fetching invoices:", response.error);
        }
        return response;
    };

    const updateInvoice = async (
        invoiceId: string,
        invoice: Partial<InvoiceUpdate>,
    ) => {
        const response = await supabase
            .from("invoices")
            .update(invoice)
            .eq("id", invoiceId)
            .select()
            .single();
        if (response.error) {
            console.error("Error updating invoice:", response.error);
        }
        return response;
    };

    const createInvoice = async (invoices: InvoiceInsert[]) => {
        const response = await supabase
            .from("invoices")
            .insert(invoices)
            .select();
        if (response.error) {
            console.error("Error creating invoice:", response.error);
        }
        return response;
    };

    const deleteInvoices = async (invoiceIds: string[]) => {
        const response = await supabase
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (response.error) {
            console.error("Error deleting invoices: ", response.error);
        }
        return response;
    };

    return {
        getInvoicesByIds,
        getInvoicesByEstablishment,
        updateInvoice,
        createInvoice,
        deleteInvoices,
    };
};

export default createInvoiceRepository;

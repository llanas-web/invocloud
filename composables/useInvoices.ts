import { createSharedComposable } from "@vueuse/core";
import type { Invoice, InvoiceInsert } from "~/types";

const _useInvoices = () => {
    const supabaseClient = useSupabaseClient();
    const supabaseUser = useSupabaseUser();
    const invoices = ref<Invoice[]>([]);
    const invoicesLoading = ref(false);

    const getInvoices = async () => {
        invoicesLoading.value = true;
        const { data, error } = await supabaseClient
            .from("invoices")
            .select("*");

        if (error) {
            console.error("Error fetching invoices:", error);
            return null;
        }
        invoices.value = data as Invoice[];
        invoicesLoading.value = false;
    };

    const createInvoice = async (invoice: InvoiceInsert, invoiceFile: File) => {
        if (!invoice) {
            console.error("Invoice data is required to create an invoice.");
            return null;
        }
        // generate id UUID
        invoice.id = crypto.randomUUID();

        // Upload the invoice file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from("invoices")
            .upload(`${supabaseUser.value!.id}/${invoice.id}`, invoiceFile);
        if (uploadError) {
            console.error("Error uploading invoice file:", uploadError);
            return null;
        }
        const { data, error } = await supabaseClient
            .from("invoices")
            .insert([invoice])
            .select()
            .single();

        if (error) {
            console.error("Error creating invoice:", error);
            return null;
        }
        // Update the local invoices array
        invoices.value.push(data as Invoice);

        return data;
    };

    const deleteInvoices = async (invoiceIds: string[]) => {
        if (!invoiceIds || invoiceIds.length === 0) {
            console.error("No invoice IDs provided for deletion.");
            return null;
        }
        const { data, error } = await supabaseClient
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (error) {
            console.error("Error deleting invoices:", error);
            return null;
        }
        // Update the local invoices array
        invoices.value = invoices.value.filter(
            (invoice) => !invoiceIds.includes(invoice.id),
        );
        return data;
    };

    return {
        invoices,
        invoicesLoading,
        getInvoices,
        createInvoice,
        deleteInvoices,
    };
};

export const useInvoices = createSharedComposable(_useInvoices);

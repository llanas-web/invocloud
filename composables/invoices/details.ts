import { createSharedComposable } from "@vueuse/core";
import type { InvoiceUpdate } from "~/types";
import type { Database } from "~/types/database.types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const supabaseClient = useSupabaseClient<Database>();
    const { refresh, pending } = useInvoices();

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: invoice,
        refresh: refreshInvoice,
        pending: isInvoiceLoading,
    } = useAsyncData(
        "invoice-details",
        async () => {
            if (!route.params.id) {
                console.error(
                    "Invoice ID is required to fetch invoice details.",
                );
                return null;
            }
            const { data, error } = await supabaseClient
                .from("invoices")
                .select(`*,
                    supplier:suppliers(id, name)
                `)
                .eq("id", invoiceId.value)
                .single();
            if (error) {
                console.error("Error fetching invoice details:", error);
                return null;
            }
            return {
                ...data,
                supplier: Array.isArray(data.supplier)
                    ? data.supplier[0]
                    : data.supplier,
            };
        },
        {
            watch: [invoiceId],
            lazy: true,
        },
    );

    const updateInvoice = async (invoiceId: string, invoice: InvoiceUpdate) => {
        if (!invoiceId || !invoice) {
            console.error(
                "Invoice ID and data are required to update an invoice.",
            );
            return null;
        }
        const { data, error } = await supabaseClient
            .from("invoices")
            .update(invoice)
            .eq("id", invoiceId)
            .select()
            .single();
        if (error) {
            console.error("Error updating invoice:", error);
            return null;
        }
        await refresh();
        return data;
    };

    return {
        invoiceId,
        invoice,
        isLoading: computed(() => pending.value || isInvoiceLoading.value),
        updateInvoice,
    };
};

export const useInvoiceDetails = createSharedComposable(_useInvoiceDetails);

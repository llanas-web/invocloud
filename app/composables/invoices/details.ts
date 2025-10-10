import { createSharedComposable } from "@vueuse/core";
import type { InvoiceUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";
import createInvoiceRepository from "~~/shared/providers/database/supabase/repositories/invoice.repository";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const supabaseClient = useSupabaseClient<Database>();
    const invoiceRepository = createInvoiceRepository(supabaseClient);
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
            const { data, error } = await invoiceRepository.getInvoicesByIds(
                [invoiceId.value],
            );
            if (error || !data || data.length === 0) {
                return null;
            }
            const invoice = data[0]!;
            return {
                ...invoice,
                supplier: Array.isArray(invoice.supplier)
                    ? invoice.supplier[0]
                    : invoice.supplier,
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
        const { data, error } = await invoiceRepository.updateInvoice(
            invoiceId,
            invoice,
        );
        if (error) {
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

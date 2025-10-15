import { createSharedComposable } from "@vueuse/core";
import z from "zod";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const supabaseClient = useSupabaseClient<Database>();
    const { getRepository } = DatabaseFactory.getInstance(supabaseClient);
    const invoiceRepository = getRepository("invoiceRepository");

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: invoice,
        pending,
        error,
        refresh,
    } = useAsyncData(
        "invoice-details",
        async () => {
            const parsed = z.uuid({
                message: "ID de facture invalide.",
            }).parse(route.params.id);
            const invoices = await invoiceRepository.getAllInvoices(
                { ids: [parsed] },
            );
            return invoices[0]!;
        },
        {
            watch: [invoiceId],
            lazy: true,
        },
    );

    return {
        invoiceId,
        invoice,
        pending,
        error,
        refresh,
    };
};

export const useInvoiceDetails = createSharedComposable(_useInvoiceDetails);

import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import useAsyncAction from "../core/useAsyncAction";

const stateSchema = z.array(z.string()).min(
    1,
    "Sélectionnez au moins une facture.",
);
type inputSchema = z.input<typeof stateSchema>;

const _useInvoicesDelete = () => {
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const invoiceRepository = getRepository("invoiceRepository");
    const open = ref(false);
    const selectedInvoices = ref<inputSchema>([]);

    const resetForm = () => {
        selectedInvoices.value = [];
    };

    const { error, pending, execute } = useAsyncAction(
        async () => {
            const parsed = stateSchema.parse(selectedInvoices.value);
            await invoiceRepository.deleteInvoices(parsed);
            resetForm();
        },
    );

    return {
        open,
        resetForm,
        error,
        pending,
        selectedInvoices,
        onSubmit: execute,
    };
};

export const useInvoicesDelete = createSharedComposable(_useInvoicesDelete);

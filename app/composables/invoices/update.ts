import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import {
    type UpdateInvoiceForm,
    UpdateInvoiceSchema,
} from "~/types/schemas/forms/invoices.schema";

const _useInvoiceUpdate = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const { getRepository } = DatabaseFactory.getInstance(supabaseClient);
    const invoiceRepository = getRepository("invoiceRepository");
    const { invoice } = useInvoiceDetails();

    const formRef = ref();
    const paidAtInputRef = ref();

    const formState = reactive<UpdateInvoiceForm>(invoice.value!);

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                Object.assign(formState, newInvoice);
            }
        },
        { immediate: true },
    );

    const { data, error, pending, execute } = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new Error("No invoice loaded.");
            }
            const parsed = UpdateInvoiceSchema.parse(formState);
            const _updatedInvoice = await invoiceRepository.updateInvoice(
                invoice.value.id,
                parsed,
            );
            Object.assign(invoice.value!, _updatedInvoice);
            navigateTo("/app");
        },
    );

    return {
        updatedInvoice: data,
        error,
        pending,
        formRef,
        formState,
        paidAtInputRef,
        onSubmit: execute,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

import { createSharedComposable } from "@vueuse/core";
import type { InvoiceUpdate } from "~/types";

const _useInvoiceUpdate = () => {
    const { invoice, updateInvoice } = useInvoiceDetails();
    const isDisabled = computed(() => invoice.value?.status === "paid");

    const formState = reactive<InvoiceUpdate>({
        status: invoice.value?.status ?? "pending",
        amount: invoice.value?.amount ?? 0,
        taxe_amount: invoice.value?.taxe_amount ?? 0,
    });

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                formState.status = newInvoice.status;
                formState.amount = newInvoice.amount;
                formState.taxe_amount = newInvoice.taxe_amount;
            }
        },
        { immediate: true },
    );

    const isDirty = computed(() => {
        if (!invoice.value) return false;
        return (
            formState.status !== invoice.value.status ||
            formState.amount !== invoice.value.amount ||
            formState.taxe_amount !== invoice.value.taxe_amount
        );
    });

    const onSubmit = async () => {
        if (!formState || !invoice.value) return;

        const updatedInvoice = await updateInvoice(
            invoice.value.id,
            formState,
        );
        if (!updatedInvoice) {
            console.error("Failed to save invoice");
            // Optional: show error toast
            return;
        }

        Object.assign(invoice.value!, formState);
        navigateTo("/app/invoices");
    };

    return {
        formState,
        isDirty,
        isDisabled,
        onSubmit,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

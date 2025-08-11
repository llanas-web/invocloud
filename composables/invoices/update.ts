import { createSharedComposable } from "@vueuse/core";
import { format } from "date-fns";
import type { InvoiceUpdate } from "~/types";

const _useInvoiceUpdate = () => {
    const { invoice, updateInvoice } = useInvoiceDetails();
    const isDisabled = computed(() => invoice.value?.status === "paid");

    const formState = reactive<InvoiceUpdate>({
        status: invoice.value?.status ?? "validated",
        amount: invoice.value?.amount ?? 0,
        taxe_amount: invoice.value?.taxe_amount ?? 0,
        name: invoice.value?.name ?? "",
        invoice_number: invoice.value?.invoice_number ?? "",
        due_date: invoice.value?.due_date
            ? format(invoice.value?.due_date, "yyyy-MM-dd")
            : "",
        paid_at: invoice.value?.paid_at
            ? format(invoice.value?.paid_at, "yyyy-MM-dd")
            : "",
    });

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                formState.status = newInvoice.status ?? "validated";
                formState.amount = newInvoice.amount;
                formState.taxe_amount = newInvoice.taxe_amount;
                formState.name = newInvoice.name;
                formState.invoice_number = newInvoice.invoice_number;
                formState.due_date = newInvoice.due_date
                    ? format(
                        newInvoice.due_date,
                        "yyyy-MM-dd",
                    )
                    : "";
                formState.paid_at = newInvoice.paid_at
                    ? format(
                        newInvoice.paid_at,
                        "yyyy-MM-dd",
                    )
                    : "";
            }
        },
        { immediate: true },
    );

    const isDirty = computed(() => {
        if (!invoice.value) return false;
        return (
            formState.status !== invoice.value.status ||
            formState.amount !== invoice.value.amount ||
            formState.taxe_amount !== invoice.value.taxe_amount ||
            formState.name !== invoice.value.name ||
            formState.invoice_number !== invoice.value.invoice_number ||
            formState.due_date !== invoice.value.due_date ||
            formState.paid_at !== invoice.value.paid_at
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
        navigateTo("/app");
    };

    return {
        formState,
        isDirty,
        isDisabled,
        onSubmit,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

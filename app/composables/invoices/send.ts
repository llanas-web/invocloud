import { createSharedComposable } from "@vueuse/core";
import { invoicesApi } from "~/services/api/invoices.api";

const _useInvoicesSend = () => {
    const open = ref(false);
    const selectedInvoices = ref<string[]>([]);
    const formState = reactive({
        email: "",
    });

    const resetForm = () => {
        formState.email = "";
        selectedInvoices.value = [];
    };

    const action = useAsyncAction(async () => {
        await invoicesApi.send({
            invoiceIds: selectedInvoices.value,
            recipientEmail: formState.email,
        });
        resetForm();
        open.value = false;
    });

    return {
        formState,
        open,
        selectedInvoices,
        resetForm,
        action,
    };
};

export const useInvoicesSend = createSharedComposable(_useInvoicesSend);

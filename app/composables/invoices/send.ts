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
            invoices: selectedInvoices.value,
            email: formState.email,
        });
        resetForm();
        open.value = false;
    }, {
        successTitle: "Factures envoyées avec succès.",
        errorTitle: "Erreur lors de l'envoi des factures.",
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

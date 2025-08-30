import { createSharedComposable } from "@vueuse/core";

const _useInvoicesSend = () => {
    const toast = useToast();

    const open = ref(false);
    const loading = ref(false);
    const selectedInvoices = ref<string[]>([]);
    const formState = reactive({
        email: "",
    });
    const { sendInvoice } = useInvoices();

    const resetForm = () => {
        formState.email = "";
        selectedInvoices.value = [];
    };

    const onSubmit = async () => {
        loading.value = true;
        const result = await sendInvoice(
            selectedInvoices.value,
            formState.email,
        );
        if (!result) {
            console.error("Failed to send invoices");
            toast.add({
                title: "Erreur",
                description:
                    "Une erreur est survenue lors de l'envoi des factures.",
                color: "error",
            });
            loading.value = false;
            return;
        }
        toast.add({
            title: "Factures envoyées",
            description: "Les factures ont été envoyées avec succès.",
            color: "success",
        });
        open.value = false;
        loading.value = false;
        resetForm();
    };

    return {
        formState,
        open,
        loading,
        selectedInvoices,
        resetForm,
        onSubmit,
    };
};

export const useInvoicesSend = createSharedComposable(_useInvoicesSend);

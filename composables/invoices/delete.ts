import { createSharedComposable } from "@vueuse/core";

const _useInvoicesDelete = () => {
    const open = ref(false);
    const loading = ref(false);
    const selectedInvoices = ref<string[]>([]);
    const { deleteInvoices } = useInvoices();
    const toast = useToast();

    const resetForm = () => {
        selectedInvoices.value = [];
    };

    const onSubmit = async () => {
        loading.value = true;
        if (selectedInvoices.value.length === 0) {
            toast.add({
                title: "Erreur",
                description:
                    "Veuillez sélectionner au moins une facture à supprimer.",
                color: "error",
            });
            loading.value = false;
            return;
        }
        const result = await deleteInvoices(selectedInvoices.value);
        if (!result) {
            console.error("Failed to delete invoices");
            toast.add({
                title: "Erreur",
                description:
                    "Une erreur est survenue lors de la suppression des factures.",
                color: "error",
            });
            loading.value = false;
            return;
        }
        toast.add({
            title: "Factures supprimées",
            description: "Les factures ont été supprimées avec succès.",
            color: "success",
        });
        open.value = false;
        loading.value = false;
        resetForm();
    };

    return {
        open,
        loading,
        selectedInvoices,
        onSubmit,
    };
};

export const useInvoicesDelete = createSharedComposable(_useInvoicesDelete);

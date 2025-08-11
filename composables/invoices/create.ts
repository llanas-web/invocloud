import { createSharedComposable } from "@vueuse/core";
import type { InvoiceInsert } from "~/types";

const _useInvoiceCreate = () => {
    const toast = useToast();
    const { createInvoice } = useInvoices();

    const isLoading = ref(false);

    const formState = reactive<InvoiceInsert>({
        file_path: "",
        supplier_id: "",
        amount: 0,
        taxe_amount: 0,
        comment: "",
        name: null,
        due_date: "",
        invoice_number: "",
    });

    const invoiceFile = ref<File | null>(null);

    const isDirty = computed(() => {
        return (
            formState.file_path !== "" ||
            formState.supplier_id !== "" ||
            formState.amount !== 0 ||
            formState.taxe_amount !== 0 ||
            formState.comment !== "" ||
            formState.name !== null ||
            formState.due_date !== "" ||
            formState.invoice_number !== ""
        );
    });

    const onSubmit = async () => {
        isLoading.value = true;
        if (!formState || !invoiceFile.value) {
            console.error("Form state or invoice file is missing.");
            toast.add({
                title: "Erreur",
                description: "Veuillez remplir tous les champs requis.",
                color: "error",
            });
            isLoading.value = false;
            return;
        }
        const newInvoice = await createInvoice(formState, invoiceFile.value);
        if (!newInvoice) {
            console.error("Failed to create invoice");
            toast.add({
                title: "Erreur",
                description: "La création de la facture a échoué.",
                color: "error",
            });
            isLoading.value = false;
            return;
        }
        isLoading.value = false;
        toast.add({
            title: "Facture créée",
            description: "La facture a été créée avec succès.",
            color: "success",
        });
        navigateTo("/app");
    };

    return {
        formState,
        isDirty,
        invoiceFile,
        isLoading,
        onSubmit,
    };
};

export const useInvoiceCreate = createSharedComposable(_useInvoiceCreate);

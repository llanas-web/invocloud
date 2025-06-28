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
    });

    const invoiceFile = ref<File | null>(null);

    const isDirty = computed(() => {
        return (
            formState.file_path !== "" ||
            formState.supplier_id !== "" ||
            formState.amount !== 0 ||
            formState.taxe_amount !== 0 ||
            formState.comment !== ""
        );
    });

    const onSubmit = async () => {
        isLoading.value = true;
        if (!formState || !invoiceFile.value) {
            console.error("Form state or invoice file is missing.");
            return;
        }
        const newInvoice = await createInvoice(formState, invoiceFile.value);
        if (!newInvoice) {
            console.error("Failed to create invoice");
            // Optional: show error toast
            return;
        }
        isLoading.value = false;
        toast.add({
            title: "Facture créée",
            description: "La facture a été créée avec succès.",
            color: "success",
        });
        navigateTo("/app/invoices");
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

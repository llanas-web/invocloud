import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import type { InvoiceInsert } from "~~/types";

const formStateSchema = z.object({
    file_path: z.string().min(1, "Le chemin du fichier est requis."),
    supplier_id: z.string().min(1, "Le fournisseur est requis."),
    amount: z.number().positive("Le montant doit être positif.").default(0),
    comment: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    due_date: z.string()
        .min(1, "La date d'échéance est requise.")
        .nullable()
        .refine((val) => val !== null && val.length > 0, {
            message: "La date d'échéance est requise.",
        }),
    invoice_number: z.string().min(1, "Le numéro de facture est requis."),
    paid_at: z.string().optional().nullable(),
    created_at: z.string().min(1, "La date de création est requise."),
    status: z.enum(["paid", "validated", "error", "pending", "sent"]).default(
        "validated",
    ),
});

type Schema = z.output<typeof formStateSchema>;

const _useInvoiceCreate = () => {
    const toast = useToast();
    const { createInvoice } = useInvoices();

    const formRef = ref();
    const isLoading = ref(false);
    const isOnError = ref(false);

    const formState = reactive<Schema>({
        file_path: "",
        supplier_id: "",
        amount: 0,
        comment: "",
        name: null,
        due_date: null,
        invoice_number: "",
        paid_at: null,
        created_at: new Date().toISOString(),
        status: "validated",
    });

    const invoiceFile = ref<File | null>(null);

    const isDirty = computed(() => {
        return (
            formState.file_path !== "" ||
            formState.supplier_id !== "" ||
            formState.amount !== 0 ||
            formState.comment !== "" ||
            formState.name !== null ||
            formState.due_date !== new Date().toISOString() ||
            formState.invoice_number !== "" ||
            formState.paid_at !== null ||
            formState.created_at !== new Date().toISOString()
        );
    });

    // Ensure amount is never null or undefined
    watch(() => formState.amount, (newValue) => {
        if (!newValue) {
            formState.amount = 0;
        }
    });

    const onSubmit = async () => {
        isLoading.value = true;
        const { success, error, data } = formStateSchema.safeParse(formState);
        if (!invoiceFile.value) {
            isOnError.value = true;
            console.error("Invoice file is missing.");
            toast.add({
                title: "Aucun fichier sélectionné",
                description:
                    "Veuillez sélectionner un fichier pour la facture.",
                color: "error",
            });
            isLoading.value = false;
            return;
        }
        if (!success || error) {
            isOnError.value = true;
            console.error("Form state or invoice file is missing.");
            toast.add({
                title: "Erreur",
                description:
                    "Le formulaire contient des erreurs. Veuillez vérifier les champs requis.",
                color: "error",
            });
            isLoading.value = false;
            return;
        }
        const newInvoice = await createInvoice(
            formState as InvoiceInsert,
            invoiceFile.value,
        );
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
        formRef,
        formState,
        formStateSchema,
        isDirty,
        invoiceFile,
        isLoading,
        onSubmit,
    };
};

export const useInvoiceCreate = createSharedComposable(_useInvoiceCreate);

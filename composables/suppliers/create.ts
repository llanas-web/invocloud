import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";

const _useSupplierCreate = () => {
    const { createSupplier } = useSuppliers();
    const isLoading = ref(false);
    const toast = useToast();

    const openModal = ref(false);

    const formState = reactive<{ name: string; emails: string[] }>({
        name: "",
        emails: [],
    });
    const emailField = ref("");

    const addEmail = () => {
        if (
            emailField.value &&
            z.string().email().safeParse(emailField.value).success
        ) {
            formState.emails
                ? formState.emails.push(emailField.value)
                : formState.emails = [emailField.value];
            emailField.value = "";
        } else {
            toast.add({
                title: "Erreur",
                description: "Adresse e-mail invalide",
                color: "error",
            });
        }
    };

    async function onSubmit() {
        isLoading.value = true;
        const newSupplier = await createSupplier(
            formState.name,
            formState.emails,
        );
        isLoading.value = false;
        if (!newSupplier) {
            toast.add({
                title: "Erreur",
                description: "Échec de la création du fournisseur",
                color: "error",
            });
            return;
        }
        toast.add({
            title: "Succès",
            description: `Nouveau fournisseur ${newSupplier.name} ajouté`,
            color: "success",
        });
        openModal.value = false;
        formState.name = "";
        formState.emails = [];
    }

    return {
        openModal,
        formState,
        isLoading,
        emailField,
        addEmail,
        onSubmit,
    };
};

export const useSupplierCreate = createSharedComposable(_useSupplierCreate);

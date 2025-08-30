import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import type { Supplier } from "~~/types";

const _useSupplierEdit = () => {
    const { updateSupplier } = useSuppliers();
    const supplier = ref<Supplier | null>(null);
    const isLoading = ref(false);
    const toast = useToast();

    const openModal = ref(false);

    const formState = reactive<{ name: string; emails: string[] }>({
        name: "",
        emails: [],
    });

    watch(
        () => supplier.value,
        (newSupplier) => {
            if (newSupplier) {
                formState.name = newSupplier.name;
                formState.emails = newSupplier.emails || [];
            } else {
                formState.name = "";
                formState.emails = [];
            }
        },
        { immediate: true },
    );

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
        const newSupplier = await updateSupplier(
            supplier.value!.id,
            {
                name: formState.name,
                emails: formState.emails,
            },
        );
        isLoading.value = false;
        if (!newSupplier) {
            toast.add({
                title: "Erreur",
                description: "Échec de la mise à jour du fournisseur",
                color: "error",
            });
            return;
        }
        toast.add({
            title: "Succès",
            description: `Fournisseur ${newSupplier.name} mis à jour`,
            color: "success",
        });
        openModal.value = false;
        formState.name = "";
        formState.emails = [];
    }

    return {
        supplier,
        openModal,
        formState,
        isLoading,
        emailField,
        addEmail,
        onSubmit,
    };
};

export const useSupplierEdit = createSharedComposable(_useSupplierEdit);

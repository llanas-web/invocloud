import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import useAsyncAction from "../core/useAsyncAction";
import {
    type UpdateSupplierForm,
    UpdateSupplierSchema,
} from "~/types/schemas/forms/suppliers.schema";
import { useSupplierDetails } from "./details";

const _useSupplierUpdate = () => {
    const { $usecases } = useNuxtApp();
    const { supplier, selectedId } = useSupplierDetails();

    const { refresh } = useSuppliers();
    const toast = useToast();

    const openModal = ref(false);

    const formState = reactive<UpdateSupplierForm>({
        name: "",
        emails: [],
    });

    const resetForm = () => {
        formState.name = "";
        formState.emails = [];
    };

    watch(supplier, (newSupplier) => {
        formState.name = newSupplier?.name || "";
        formState.emails = newSupplier?.emails || [];
    });

    const emailField = ref("");

    const addEmail = () => {
        if (
            emailField.value &&
            z.email().safeParse(emailField.value).success
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

    const { data: updatedSupplier, error, pending, execute } = useAsyncAction(
        async () => {
            if (!supplier.value) {
                throw new Error("No supplier selected.");
            }
            const parsed = UpdateSupplierSchema.parse(formState);
            await $usecases.suppliers.update.execute({
                id: supplier.value.id,
                ...parsed,
            });
            openModal.value = false;
            toast.add({
                title: "Succès",
                description: "Fournisseur mis à jour avec succès",
                color: "success",
            });
            resetForm();
            selectedId.value = null;
            await refresh();
        },
    );

    return {
        supplier,
        updatedSupplier,
        error,
        pending,
        openModal,
        formState,
        emailField,
        addEmail,
        onSubmit: execute,
    };
};

export const useSupplierUpdate = createSharedComposable(_useSupplierUpdate);

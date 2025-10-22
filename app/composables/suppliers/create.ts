import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import type { CreateSupplierForm } from "~/types/schemas/forms/suppliers.schema";

const _useSupplierCreate = () => {
    const { $usecases } = useNuxtApp();
    const { selectedId } = useEstablishmentsList();
    const { refresh } = useSuppliers();
    const toast = useToast();

    const openModal = ref(false);

    const formState = reactive<CreateSupplierForm>({
        name: "",
        emails: [],
    });

    const resetForm = () => {
        formState.name = "";
        formState.emails = [];
    };

    const emailField = ref("");

    const addEmail = () => {
        const { data, success } = z.email().safeParse(emailField.value);
        if (!success) {
            toast.add({
                title: "Erreur",
                description: "Adresse e-mail invalide",
                color: "error",
            });
            return;
        }
        formState.emails
            ? formState.emails.push(data)
            : formState.emails = [data];
        emailField.value = "";
    };

    const { error, pending, execute } = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new Error("No establishment selected.");
            }
            const _newSupplier = await $usecases.suppliers.create.execute({
                name: formState.name,
                establishment_id: selectedId.value,
                emails: formState.emails,
            });
            openModal.value = false;
            resetForm();
            await refresh();
        },
    );

    return {
        error,
        pending,
        openModal,
        formState,
        emailField,
        addEmail,
        onSubmit: execute,
    };
};

export const useSupplierCreate = createSharedComposable(_useSupplierCreate);

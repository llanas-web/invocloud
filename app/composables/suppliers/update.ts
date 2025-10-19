import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import type SupplierModel from "~~/shared/types/models/supplier.model";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import {
    type UpdateSupplierForm,
    UpdateSupplierSchema,
} from "~/types/schemas/forms/suppliers.schema";

const _useSupplierUpdate = () => {
    const { $databaseFactory } = useNuxtApp();
    const { supplierRepository } = $databaseFactory as DatabaseFactory;

    const { refresh } = useSuppliers();
    const supplier = ref<SupplierModel | null>(null);
    const toast = useToast();

    const openModal = ref(false);

    const formState = reactive<UpdateSupplierForm>({
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
            const _updatedSupplier = await supplierRepository.updateSupplier(
                supplier.value.id,
                parsed,
            );
            supplier.value = _updatedSupplier;
            openModal.value = false;
            formState.name = "";
            formState.emails = [];
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

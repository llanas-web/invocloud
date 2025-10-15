import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import type SupplierModel from "~~/shared/models/supplier.model";
import useAsyncAction from "../core/useAsyncAction";
import type { SupplierModelUpdate } from "~~/shared/models/supplier.model";
import DatabaseFactory from "~~/shared/providers/database/database-factory";

const _useSupplierEdit = () => {
    const supabase = useSupabaseClient();
    const { getRepository } = DatabaseFactory.getInstance(supabase);
    const supplierRepository = getRepository("supplierRepository");
    const { selectedEstablishment } = useEstablishments();

    const { refresh } = useSuppliers();
    const supplier = ref<SupplierModel | null>(null);
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
        async (supplierId: string, updatedSupplier: SupplierModelUpdate) => {
            if (!selectedEstablishment.value) {
                throw new Error("No establishment selected.");
            }
            const _updatedSupplier = await supplierRepository.updateSupplier(
                supplierId,
                updatedSupplier,
            );
            openModal.value = false;
            formState.name = "";
            formState.emails = [];
            await refresh();
            return _updatedSupplier;
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

export const useSupplierEdit = createSharedComposable(_useSupplierEdit);

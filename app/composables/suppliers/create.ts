import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database-factory";

const _useSupplierCreate = () => {
    const supabase = useSupabaseClient();
    const { getRepository } = DatabaseFactory.getInstance(supabase);
    const supplierRepository = getRepository("supplierRepository");
    const { selectedEstablishment } = useEstablishments();
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

    const { data: newSupplier, error, pending, execute } = useAsyncAction(
        async (name: string, emails: string[]) => {
            if (!selectedEstablishment.value) {
                throw new Error("No establishment selected.");
            }
            const _newSupplier = await supplierRepository.createSupplier({
                name,
                establishment_id: selectedEstablishment.value.id,
                emails,
            });
            openModal.value = false;
            formState.name = "";
            formState.emails = [];
            return _newSupplier;
        },
    );

    return {
        newSupplier,
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

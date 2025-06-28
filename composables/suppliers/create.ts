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
            useToast().add({
                title: "Error",
                description: "Invalid email address",
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
                title: "Error",
                description: "Failed to create supplier",
                color: "error",
            });
            return;
        }
        toast.add({
            title: "Success",
            description: `New supplier ${newSupplier.name} added`,
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

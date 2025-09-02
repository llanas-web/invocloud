import { createSharedComposable } from "@vueuse/core";
import type { Establishment } from "~~/types";
import { FetchError } from "ofetch";

const _useInvoiceUpload = () => {
    const toast = useToast();
    const { currentUser } = useUser();
    const open = ref(false);
    const stepIndex = ref(0);
    const isLoading = ref(false);
    const formState = reactive({
        senderEmail: currentUser.value?.email ?? "",
        recipientEmail: "",
        comment: "",
        invoiceFile: undefined as File | undefined,
    });
    const invoiceId = ref<string | null>(null);
    const tokenState = reactive({
        confirmToken: [] as string[],
    });
    const uploadUrl = ref<string | null>(null);
    const possibleEstablishments = ref<Partial<Establishment>[]>([]);
    const confirmState = reactive({
        establishmentId: "",
        supplierId: "",
    });

    watch(
        () => currentUser.value,
        (newUser) => {
            if (newUser) {
                formState.senderEmail = newUser.email;
            }
        },
        { immediate: true },
    );

    const submitFormStep = async () => {
        isLoading.value = true;
        try {
            const { establishements, invoice_id, success } = await $fetch<
                ReturnType<
                    typeof import("~~/server/api/invoices/request-upload.post").default
                >
            >("/api/invoices/request-upload", {
                method: "POST",
                body: {
                    senderEmail: formState.senderEmail,
                    recipientEmail: formState.recipientEmail,
                    comment: formState.comment,
                    name: formState.invoiceFile!.name,
                },
            });
            if (currentUser) {
                if (establishements != null) {
                    possibleEstablishments.value = establishements;
                    if (possibleEstablishments.value.length === 1) {
                        confirmState.establishmentId = possibleEstablishments
                            .value[0]!
                            .id!;
                    }
                }
            }
            invoiceId.value = invoice_id;
            stepIndex.value++;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Error",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Impossible de demander l'upload",
                color: "error",
            });
            return;
        } finally {
            isLoading.value = false;
        }
    };

    const submitTokenStep = async () => {
        isLoading.value = true;
        try {
            const { uploadValidation, establishments } = await $fetch<
                ReturnType<
                    typeof import("~~/server/api/invoices/validate-token.post").default
                >
            >("/api/invoices/validate-token", {
                method: "POST",
                body: {
                    uploadValidationId: invoiceId.value,
                    token: tokenState.confirmToken.join(""),
                },
            });
            if (!establishments || establishments.length === 0) {
                throw new Error("Aucun établissement trouvé");
            }
            possibleEstablishments.value = establishments;
            if (possibleEstablishments.value.length === 1) {
                confirmState.establishmentId = possibleEstablishments.value[0]!
                    .id!;
            }
            stepIndex.value++;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Error",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Échec de la validation du token",
                color: "error",
            });
            return;
        } finally {
            isLoading.value = false;
        }
    };

    const confirmUpload = async () => {
        isLoading.value = true;
        if (!confirmState.establishmentId) {
            toast.add({
                title: "Error",
                description:
                    "Veuillez sélectionner un établissement et un fournisseur",
                color: "error",
            });
            isLoading.value = false;
            return;
        }

        try {
            const { url } = await $fetch<
                ReturnType<
                    typeof import("~~/server/api/invoices/validate-upload.post").default
                >
            >("/api/invoices/validate-upload", {
                method: "POST",
                body: {
                    invoiceId: invoiceId.value,
                    selectedEstablishmentId: confirmState.establishmentId,
                },
            });
            uploadUrl.value = url;
            if (!uploadUrl.value) {
                throw new Error("Aucun URL d'upload retourné");
            }
            const formData = new FormData();
            formData.append("file", formState.invoiceFile!);
            formData.append("path", uploadUrl.value);
            const response = await fetch(uploadUrl.value, {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Échec de l'upload du fichier");
            }
            toast.add({
                title: "Succès",
                description: "Upload confirmé avec succès",
                icon: "check",
                color: "success",
            });
            open.value = false;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Erreur",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Échec de la demande d'upload",
                color: "error",
            });
        } finally {
            isLoading.value = false;
        }
    };

    const openModal = () => {
        open.value = true;
        stepIndex.value = 0;
    };

    const closeModal = () => {
        open.value = false;
    };

    const onValidate = () => {
        switch (stepIndex.value) {
            case 0:
                submitFormStep();
                break;
            case 1:
                currentUser.value != null ? confirmUpload() : submitTokenStep();
                break;
            case 2:
                confirmUpload();
                break;
        }
    };

    const onPrev = () => {
        if (stepIndex.value > 0) {
            stepIndex.value--;
        }
    };

    return {
        open,
        stepIndex,
        isLoading,
        formState,
        tokenState,
        confirmState,
        possibleEstablishments,
        openModal,
        submitFormStep,
        submitTokenStep,
        confirmUpload,
        closeModal,
        onPrev,
        onValidate,
    };
};

export const useInvoiceUpload = createSharedComposable(
    _useInvoiceUpload,
);

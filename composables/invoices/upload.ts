import { createSharedComposable } from "@vueuse/core";
import type { Establishment } from "~/types";
import { FetchError } from "ofetch";

const _useInvoiceUpload = () => {
    const toast = useToast();
    const open = ref(false);
    const stepIndex = ref(0);
    const isLoading = ref(false);
    const formState = reactive({
        senderEmail: "",
        recipientEmail: "",
        comment: "",
        invoiceFile: undefined as File | undefined,
    });
    const validationUploadId = ref<string | null>(null);
    const tokenState = reactive({
        confirmToken: [] as string[],
    });
    const uploadUrl = ref<string | null>(null);
    const possibleEstablishments = ref<Establishment[]>([]);
    const confirmState = reactive({
        establishmentId: "",
        supplierId: "",
    });

    const submitFormStep = async () => {
        isLoading.value = true;
        try {
            const { upload_validation_id, expires_at, success } = await $fetch<
                ReturnType<
                    typeof import("~/server/api/invoices/request-upload.post").default
                >
            >("/api/invoices/request-upload", {
                method: "POST",
                body: {
                    sendorEmail: formState.senderEmail,
                    recipientEmail: formState.recipientEmail,
                    comment: formState.comment,
                    name: formState.invoiceFile!.name,
                },
            });
            validationUploadId.value = upload_validation_id;
            stepIndex.value++;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Error",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Failed to request upload",
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
                    typeof import("~/server/api/invoices/validate-token.post").default
                >
            >("/api/invoices/validate-token", {
                method: "POST",
                body: {
                    uploadValidationId: validationUploadId.value,
                    token: tokenState.confirmToken.join(""),
                },
            });
            if (!establishments || establishments.length === 0) {
                throw new Error("No establishments found");
            }
            possibleEstablishments.value = establishments;
            if (possibleEstablishments.value.length === 1) {
                confirmState.establishmentId =
                    possibleEstablishments.value[0].id;
            }
            stepIndex.value++;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Error",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Failed to request upload",
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
                description: "Please select an establishment and supplier",
                color: "error",
            });
            return;
        }

        try {
            const { url } = await $fetch<
                ReturnType<
                    typeof import("~/server/api/invoices/validate-upload.post").default
                >
            >("/api/invoices/validate-upload", {
                method: "POST",
                body: {
                    uploadValidationId: validationUploadId.value,
                    selectedEstablishmentId: confirmState.establishmentId,
                },
            });
            uploadUrl.value = url;
            if (!uploadUrl.value) {
                throw new Error("No upload URL returned");
            }
            const formData = new FormData();
            formData.append("file", formState.invoiceFile!);
            formData.append("path", uploadUrl.value);
            const response = await fetch(uploadUrl.value, {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Failed to upload file");
            }
            toast.add({
                title: "Success",
                description: "Upload confirmed successfully",
                icon: "check",
                color: "success",
            });
            open.value = false;
        } catch (error) {
            console.error("Error requesting upload:", error);
            toast.add({
                title: "Error",
                description: (error instanceof FetchError)
                    ? error.data?.message
                    : "Failed to request upload",
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
                submitTokenStep();
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

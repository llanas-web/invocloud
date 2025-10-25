import { createSharedComposable } from "@vueuse/core";
import { FetchError } from "ofetch";
import { invoicesApi } from "~/services/api/invoices.api";

const _useUploadWizard = () => {
    const toast = useToast();
    const { currentUser } = useUser();
    const { connectedUser } = useAuth();

    const open = ref(false);
    const pending = computed(() =>
        submitFormStep.pending ||
        submitTokenStep.pending || confirmUpload.pending
    );
    const stepIndex = ref(0);
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
    const possibleEstablishmentIds = ref<string[]>([]);
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

    const submitFormStep = useAsyncAction(
        async () => {
            const serverCall = (connectedUser.value?.isAnonymous)
                ? invoicesApi.requestUploadAnonymous
                : invoicesApi.requestUpload;
            const uploadId = await serverCall({
                senderEmail: formState.senderEmail,
                recipientEmail: formState.recipientEmail,
            });
            invoiceId.value = uploadId;
            stepIndex.value++;
        },
    );

    const submitTokenStep = useAsyncAction(
        async () => {
            const { establishments } = await invoicesApi.validateUpload({
                uploadValidationId: invoiceId.value!,
                token: tokenState.confirmToken.join(""),
            });
            if (!establishments || establishments.length === 0) {
                throw new Error("Aucun établissement trouvé");
            }
            possibleEstablishmentIds.value = establishments;
            stepIndex.value++;
        },
    );

    const confirmUpload = useAsyncAction(
        async () => {
            const serverCall = (!connectedUser.value?.isAnonymous)
                ? invoicesApi.sendUpload
                : invoicesApi.sendUploadAnonymous;
            uploadUrl.value = await serverCall({
                selectedEstablishmentId: confirmState.establishmentId,
                uploadValidationId: invoiceId.value!,
                comment: formState.comment,
                fileName: formState.invoiceFile!.name,
            });
            await invoicesApi.uploadFile(
                uploadUrl.value,
                formState.invoiceFile!,
            );
            toast.add({
                title: "Succès",
                description: "Upload confirmé avec succès",
                icon: "check",
                color: "success",
            });
            open.value = false;
        },
    );

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
                submitFormStep.execute();
                break;
            case 1:
                currentUser.value != null
                    ? confirmUpload.execute()
                    : submitTokenStep.execute();
                break;
            case 2:
                confirmUpload.execute();
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
        isLoading: pending,
        formState,
        tokenState,
        confirmState,
        possibleEstablishmentIds,
        openModal,
        submitFormStep,
        submitTokenStep,
        confirmUpload,
        closeModal,
        onPrev,
        onValidate,
    };
};

export const useUploadWizard = createSharedComposable(
    _useUploadWizard,
);

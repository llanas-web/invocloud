import { createSharedComposable } from "@vueuse/core";
import type { StorageProvider } from "~~/shared/application/common/providers/storage/storage.repository";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const { $usecases, $storageFactory } = useNuxtApp();
    const storageRepository = $storageFactory as StorageProvider;

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: model,
        pending,
        error,
        refresh,
    } = useAsyncData(
        "invoice-details",
        async () => {
            if (!invoiceId.value) return null;
            return await $usecases.invoices.details.execute(invoiceId.value);
        },
        {
            watch: [invoiceId],
            lazy: true,
        },
    );

    const invoice = computed(() => {
        if (!model.value) return null;
        return {
            id: model.value.id,
            name: model.value.name,
            amount: model.value.amount,
            filePath: model.value.filePath,
            invoiceNumber: model.value.number,
            emitDate: model.value.emitDate,
            dueDate: model.value.dueDate,
            status: model.value.status,
            paidAt: model.value.paidAt,
            comment: model.value.comment,
        };
    });

    const downloadAction = useAsyncAction(
        async () => {
            if (!invoiceId.value) {
                throw new Error("No invoice loaded.");
            }
            const blob = await storageRepository.downloadFile(
                STORAGE_BUCKETS.INVOICES,
                model.value!.filePath,
            );
            return blob;
        },
    );

    return {
        invoiceId,
        model,
        invoice,
        pending,
        error,
        refresh,
        actions: {
            download: downloadAction,
        },
    };
};

export const useInvoiceDetails = createSharedComposable(_useInvoiceDetails);

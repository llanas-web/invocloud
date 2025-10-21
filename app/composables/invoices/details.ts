import { createSharedComposable } from "@vueuse/core";
import z from "zod";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const { $usecases, $storageFactory } = useNuxtApp();
    const storageRepository = $storageFactory as StorageProvider;

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: invoice,
        pending,
        error,
        refresh,
    } = useAsyncData(
        "invoice-details",
        async () => {
            const parsed = z.uuid({ message: "ID de facture invalide." }).parse(
                route.params.id,
            );
            const invoices = await $usecases.invoices.list.execute({
                ids: [parsed],
            });
            return invoices[0]!;
        },
        {
            watch: [invoiceId],
            lazy: true,
        },
    );

    const downloadAction = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new Error("No invoice loaded.");
            }
            const blob = await storageRepository.downloadFile(
                STORAGE_BUCKETS.INVOICES,
                invoice.value!.filePath,
            );
            return blob;
        },
    );

    return {
        invoiceId,
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

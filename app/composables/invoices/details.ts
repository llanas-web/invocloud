import { createSharedComposable } from "@vueuse/core";
import z from "zod";
import { InvoiceViewModel } from "~/viewmodels/invoice/invoice.vm";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

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

    const invoice = computed<InvoiceViewModel | null>(() => {
        if (!model.value) return null;
        return new InvoiceViewModel(model.value!);
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

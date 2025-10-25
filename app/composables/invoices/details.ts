import { createSharedComposable } from "@vueuse/core";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const { $usecases, $storageRepository } = useNuxtApp();

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: dto,
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
        if (!dto.value) return null;
        return {
            id: dto.value.id,
            name: dto.value.name,
            amount: dto.value.amount,
            filePath: dto.value.filePath,
            invoiceNumber: dto.value.number,
            emitDate: dto.value.emitDate,
            dueDate: dto.value.dueDate,
            status: dto.value.status,
            paidAt: dto.value.paidAt,
            comment: dto.value.comment,
            supplierName: dto.value.supplierName,
            supplierId: dto.value.supplierId,
            source: dto.value.source,
            createdAt: dto.value.createdAt,
            updatedAt: dto.value.updatedAt,
        };
    });

    const downloadAction = useAsyncAction(
        async () => {
            if (!invoiceId.value) {
                throw new Error("No invoice loaded.");
            }
            const blob = await $storageRepository.downloadFile(
                STORAGE_BUCKETS.INVOICES,
                dto.value!.filePath,
            );
            return blob;
        },
    );

    return {
        invoiceId,
        dto,
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

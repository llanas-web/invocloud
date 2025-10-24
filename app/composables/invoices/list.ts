import { createSharedComposable } from "@vueuse/core";
import { invoicesApi } from "~/services/api/invoices.api";
import type { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

const _useInvoices = () => {
    const { $storageFactory, $usecases } = useNuxtApp();
    const storageRepository = $storageFactory as StorageProvider;
    const { selectedId } = useEstablishmentsList();

    const searchQuery = ref<string>("");
    const statusFilter = ref<InvoiceStatus | undefined>(undefined);
    const supplierFilter = ref<string[]>([]);
    const rangeFilter = ref<{ start: Date; end: Date }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date(),
    });

    const {
        data: dtos,
        error,
        refresh,
        pending,
    } = useAsyncData(
        "invoices",
        async () => {
            if (!selectedId.value) return [];
            return await $usecases.invoices.list.execute({
                establishmentIds: [selectedId.value],
                supplierIds: supplierFilter.value.length > 0
                    ? supplierFilter.value
                    : undefined,
                status: statusFilter.value ? [statusFilter.value] : undefined,
                search: searchQuery.value,
            });
        },
        {
            default: () => [],
            watch: [
                selectedId,
                searchQuery,
                statusFilter,
                supplierFilter,
            ],
            lazy: true,
        },
    );

    const invoices = computed(() => {
        return dtos.value.map((dto) => ({
            id: dto.id,
            name: dto.name,
            amount: dto.amount,
            invoiceNumber: dto.number,
            emitDate: dto.emitDate,
            dueDate: dto.dueDate,
            status: dto.status,
            paidAt: dto.paidAt,
        }));
    });

    const updateStatusAction = useAsyncAction(
        async (
            invoiceId: string,
            status: InvoiceStatus,
            paidAt?: Date | null,
        ) => {
            await $usecases.invoices.updateStatus.execute({
                id: invoiceId,
                status,
                paidAt: paidAt ?? undefined,
            });
            await refresh();
        },
    );

    const sendAction = useAsyncAction(
        async (invoiceIds: string[], email: string) => {
            await invoicesApi.send({
                invoices: invoiceIds,
                email,
            });
        },
    );

    const downloadAction = useAsyncAction(
        async (filePath: string) => {
            const blob = await storageRepository.downloadFile(
                STORAGE_BUCKETS.INVOICES,
                filePath,
            );

            if (!blob) throw error || new Error("No blob found");
            return blob;
        },
    );

    return {
        invoices,
        refresh,
        pending,
        error,
        searchQuery,
        statusFilter,
        supplierFilter,
        rangeFilter,
        actions: {
            updateStatus: updateStatusAction,
            send: sendAction,
            download: downloadAction,
        },
    };
};

export const useInvoices = createSharedComposable(_useInvoices);

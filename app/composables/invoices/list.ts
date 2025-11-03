import { createSharedComposable } from "@vueuse/core";
import { invoicesApi } from "~/services/api/invoices.api";
import type { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";
import { AppError } from "~/core/errors/app.error";

const _useInvoices = () => {
    const { $usecases, $storageRepository, $queries } = useNuxtApp();
    const { selectedId } = useEstablishmentsList();

    const tableRef = useTemplateRef("invoicesTable");

    const searchQuery = ref<string>("");
    const statusFilter = ref<InvoiceStatus | "overdue" | undefined>(undefined);
    const supplierFilter = ref<string[]>([]);
    const rangeFilter = ref<{ start: Date; end: Date }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
    });

    const {
        data: dtos,
        error,
        refresh,
        pending,
    } = useAsyncData(
        "invoices",
        async () => {
            try {
                if (!selectedId.value) return [];
                const overdue = statusFilter.value === "overdue"
                    ? true
                    : undefined;
                const status =
                    statusFilter.value && statusFilter.value !== "overdue"
                        ? [statusFilter.value]
                        : undefined;
                const search = searchQuery.value
                    ? searchQuery.value
                    : undefined;
                return await $queries.invoiceQuery.listInvoices({
                    establishmentIds: [selectedId.value],
                    supplierIds: supplierFilter.value.length > 0
                        ? supplierFilter.value
                        : undefined,
                    dateFrom: rangeFilter.value.start,
                    dateTo: rangeFilter.value.end,
                    overdue,
                    status,
                    search,
                });
            } catch (err) {
                throw AppError.fromUnknownError(err);
            }
        },
        {
            default: () => [],
            watch: [
                selectedId,
                searchQuery,
                statusFilter,
                supplierFilter,
                rangeFilter,
            ],
            lazy: true,
        },
    );

    const invoices = computed(() => {
        return dtos.value.map((dto) => ({
            id: dto.id,
            name: dto.name,
            amount: dto.amount,
            number: dto.number,
            emitDate: dto.emitDate,
            dueDate: dto.dueDate,
            status: dto.status,
            paidAt: dto.paidAt,
            comment: dto.comment,
            supplierName: dto.supplierName,
            supplierId: dto.supplierId,
            source: dto.source,
            filePath: dto.filePath,
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
        {
            successTitle: "Statut de la facture mis à jour avec succès.",
            errorTitle:
                "Erreur lors de la mise à jour du statut de la facture.",
        },
    );

    const sendAction = useAsyncAction(
        async (invoiceIds: string[], email: string) => {
            await invoicesApi.send({
                invoices: invoiceIds,
                email,
            });
        },
        {
            successTitle: "Factures envoyées avec succès.",
            errorTitle: "Erreur lors de l'envoi des factures.",
        },
    );

    const downloadAction = useAsyncAction(
        async (filePath: string) => {
            const blob = await $storageRepository.downloadFile(
                STORAGE_BUCKETS.INVOICES,
                filePath,
            );

            if (!blob) throw error || new Error("No blob found");
            return blob;
        },
        {
            showToast: false,
            errorTitle: "Erreur lors du téléchargement de la facture.",
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

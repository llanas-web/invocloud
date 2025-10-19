import { createSharedComposable } from "@vueuse/core";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import useAsyncAction from "../core/useAsyncAction";

const _useInvoices = () => {
    const { invoiceRepository } = inject("databaseFactory") as DatabaseFactory;
    const storageRepository = inject("storageFactory") as StorageProvider;

    const { selectedEstablishment } = useEstablishmentsList();

    const { data: invoices, error, refresh, pending } = useAsyncData(
        "invoices",
        async () => {
            const invoices = await invoiceRepository
                .getAllInvoices({
                    establishmentIds: [selectedEstablishment.value!.id],
                });
            return invoices;
        },
        {
            default: () => [],
            watch: [selectedEstablishment],
            lazy: true,
        },
    );

    const pendingInvoices = computed(() =>
        invoices.value?.filter((i) =>
            i.status === "pending" || i.status === "ocr"
        ) || []
    );

    const sendInvoice = async (invoicesId: string[], email: string) => {
        if (!invoicesId || invoicesId.length === 0) {
            console.error("Invoice IDDs are required to send invoices.");
            return null;
        }
        const { message, success } = await $fetch<
            ReturnType<
                typeof import("~~/server/api/security/invoice/send.post").default
            >
        >(
            `/api/invoices/send`,
            {
                method: "POST",
                body: {
                    invoices: invoicesId,
                    email,
                },
            },
        );
        if (!success) {
            console.error("Error sending invoices:", message);
            return null;
        }
        return success;
    };

    const downloadInvoiceFile = async (filePath: string) => {
        console.log("Downloading invoice file from path:", filePath);
        const blob = await storageRepository.downloadFile(
            STORAGE_BUCKETS.INVOICES,
            filePath,
        );

        if (!blob) throw error || new Error("No blob found");
        return blob;
    };

    return {
        invoices,
        refresh,
        pending,
        error,
        pendingInvoices,
        sendInvoice,
        downloadInvoiceFile,
    };
};

export const useInvoices = createSharedComposable(_useInvoices);

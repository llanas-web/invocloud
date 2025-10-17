import { createSharedComposable } from "@vueuse/core";
import z from "zod";
import {
    type UpdateInvoiceForm,
    UpdateInvoiceSchema,
} from "~/types/schemas/forms/invoices.schema";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

const _useInvoiceDetails = () => {
    const route = useRoute();
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const storageRepository = inject("storageFactory") as StorageProvider;
    const invoiceRepository = getRepository("invoiceRepository");

    const invoiceId = computed(() => route.params.id as string);

    const {
        data: invoice,
        pending,
        error,
        refresh,
    } = useAsyncData(
        "invoice-details",
        async () => {
            const parsed = z.uuid({
                message: "ID de facture invalide.",
            }).parse(route.params.id);
            const invoices = await invoiceRepository.getAllInvoices(
                { ids: [parsed] },
            );
            return invoices[0]!;
        },
        {
            watch: [invoiceId],
            lazy: true,
        },
    );

    const formState = reactive<UpdateInvoiceForm>(
        invoice.value ?? {
            invoiceNumber: "",
            createdAt: new Date(),
            dueDate: new Date(),
            amount: 0,
        },
    );

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                Object.assign(formState, newInvoice);
            }
        },
        { immediate: true },
    );

    const updateAction = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new Error("No invoice loaded.");
            }
            const parsed = UpdateInvoiceSchema.parse(formState);
            const _updatedInvoice = await invoiceRepository.updateInvoice(
                invoice.value.id,
                parsed,
            );
            Object.assign(invoice.value!, _updatedInvoice);
            navigateTo("/app");
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
            update: updateAction,
            download: downloadAction,
        },
    };
};

export const useInvoiceDetails = createSharedComposable(_useInvoiceDetails);

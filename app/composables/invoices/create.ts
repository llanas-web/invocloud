import { createSharedComposable } from "@vueuse/core";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import useAsyncAction from "../core/useAsyncAction";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import type { InvoiceInsert } from "~~/shared/types/providers/database";
import {
    type CreateInvoiceCommand,
    CreateInvoiceSchema,
} from "~~/shared/application/invoice/command";

const _useInvoiceCreate = () => {
    const { $databaseFactory, $storageFactory, $usecases } = useNuxtApp();
    const { invoiceRepository } = $databaseFactory as DatabaseFactory;
    const storageRepository = $storageFactory as StorageProvider;
    const { selectedEstablishment } = useEstablishmentsList();

    const formRef = ref();

    const formState = reactive<CreateInvoiceCommand>({
        filePath: "",
        supplierId: "",
        amount: 0,
        comment: "",
        name: null,
        dueDate: null,
        invoiceNumber: "",
        paidAt: null,
        status: "pending",
        source: "app",
    });

    const invoiceFile = ref<File | null>(null);

    const initialParsed = CreateInvoiceSchema.parse(formState);

    const isDirty = computed(() => {
        const currentParsed = CreateInvoiceSchema.parse(formState);
        return JSON.stringify(currentParsed) !== JSON.stringify(initialParsed);
    });

    const { data: newInvoice, error, pending, execute } = useAsyncAction(
        async () => {
            const parsedInvoice = CreateInvoiceSchema.parse(formState);
            if (!invoiceFile.value) {
                throw new Error("No invoice file provided.");
            }
            const newInvoiceId = crypto.randomUUID();
            const uploadResult = await storageRepository.uploadFile(
                STORAGE_BUCKETS.INVOICES,
                `${selectedEstablishment.value!.id}/${newInvoiceId}`,
                invoiceFile.value,
                { contentType: invoiceFile.value.type, upsert: true },
            );
            const newInvoice = await $usecases.invoices.create.execute(
                parsedInvoice,
            );
            navigateTo("/app");
        },
    );

    return {
        formRef,
        formState,
        isDirty,
        invoiceFile,
        onSubmit: execute,
        newInvoice,
        error,
        pending,
    };
};

export const useInvoiceCreate = createSharedComposable(_useInvoiceCreate);

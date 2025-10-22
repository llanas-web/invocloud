import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import type { z } from "zod";
import { CreateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";
import type { CreateInvoiceCommand } from "~~/shared/application/invoice/command";

const toCreateInvoiceCommand = (
    parsed: z.output<typeof CreateInvoiceSchema>,
): CreateInvoiceCommand => ({
    supplierId: parsed.supplierId,
    filePath: parsed.filePath,
    source: parsed.source,
    status: parsed.status,
    // optional fields
    name: parsed.name,
    invoiceNumber: parsed.invoiceNumber,
    amount: parsed.amount,
    comment: parsed.comment,
    emitDate: parsed.emitDate,
    paidAt: parsed.paidAt,
    dueDate: parsed.dueDate,
});

const _useInvoiceCreate = () => {
    const { $storageFactory, $usecases } = useNuxtApp();
    const storageRepository = $storageFactory as StorageProvider;
    const { selectedId } = useEstablishmentsList();

    const formRef = ref();

    const formState = reactive<Partial<z.input<typeof CreateInvoiceSchema>>>({
        filePath: "",
        supplierId: "",
        amount: 0,
        comment: "",
        name: null,
        dueDate: undefined,
        invoiceNumber: "",
        paidAt: null,
        status: "pending",
        source: "app",
    });

    const invoiceFile = ref<File | null>(null);

    const { data: newInvoice, error, pending, execute } = useAsyncAction(
        async () => {
            const parsed = CreateInvoiceSchema.parse(formState);
            if (!invoiceFile.value) {
                throw new Error("No invoice file provided.");
            }
            const command = toCreateInvoiceCommand(parsed);
            const newInvoiceId = crypto.randomUUID();
            const uploadResult = await storageRepository.uploadFile(
                STORAGE_BUCKETS.INVOICES,
                `${selectedId.value}/${newInvoiceId}`,
                invoiceFile.value,
                { contentType: invoiceFile.value.type, upsert: true },
            );
            const newInvoice = await $usecases.invoices.create.execute(
                command,
            );
            navigateTo("/app");
        },
    );

    return {
        formRef,
        formState,
        invoiceFile,
        onSubmit: execute,
        newInvoice,
        error,
        pending,
    };
};

export const useInvoiceCreate = createSharedComposable(_useInvoiceCreate);

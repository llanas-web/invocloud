import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import type { z } from "zod";
import { CreateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";
import type { CreateInvoiceCommand } from "~~/shared/application/invoice/usecases/create-invoice.usecase";

const toCreateInvoiceCommand = (
    parsed: z.output<typeof CreateInvoiceSchema>,
    establishmentId: string,
    file: File,
): CreateInvoiceCommand => ({
    supplierId: parsed.supplierId,
    establishmentId,
    status: parsed.status,
    // optional fields
    name: parsed.name,
    invoiceNumber: parsed.invoiceNumber,
    amount: parsed.amount,
    comment: parsed.comment,
    emitDate: parsed.emitDate,
    paidAt: parsed.paidAt,
    dueDate: parsed.dueDate,
    file,
});

const _useInvoiceCreate = () => {
    const { $usecases } = useNuxtApp();
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
            const command = toCreateInvoiceCommand(
                parsed,
                selectedId.value!,
                invoiceFile.value,
            );
            await $usecases.invoices.create.execute(command);
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

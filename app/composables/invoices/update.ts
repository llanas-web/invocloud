import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import {
    type UpdateInvoiceForm,
    UpdateInvoiceFormSchema,
} from "~/types/schemas/forms/invoices.schema";
import { z } from "zod";
import type { UpdateInvoiceDetailsCommand } from "~~/shared/application/invoice/commands";
import { AppError } from "~/core/errors/app.error";

// Mapping UI → Application command
const toUpdateDetailsCommand = (
    parsed: z.output<typeof UpdateInvoiceFormSchema>,
): UpdateInvoiceDetailsCommand => ({
    id: parsed.id,
    name: parsed.name ?? undefined,
    amount: parsed.amount ?? undefined,
    emitDate: parsed.emitDate ?? undefined,
    dueDate: parsed.dueDate ?? undefined,
    number: parsed.invoiceNumber ?? undefined,
    comment: parsed.comment ?? undefined,
    status: parsed.status ?? undefined,
    paidAt: parsed.paidAt ?? undefined,
});

const _useInvoiceUpdate = () => {
    const { $usecases } = useNuxtApp();
    const { invoice } = useInvoiceDetails();

    const formRef = ref();
    const paidAtInputRef = ref();

    const formState = reactive<UpdateInvoiceForm>({
        id: "",
        invoiceNumber: "",
        emitDate: new Date(),
        dueDate: new Date(),
        amount: 0,
        name: null,
        comment: null,
        status: "validated",
        paidAt: null,
    });

    watch(invoice, (newInvoice) => {
        if (newInvoice) {
            formState.id = newInvoice.id;
            formState.invoiceNumber = newInvoice.invoiceNumber ?? "";
            formState.emitDate = newInvoice.emitDate ?? new Date();
            formState.dueDate = newInvoice.dueDate ?? new Date();
            formState.amount = newInvoice.amount ?? 0;
            formState.name = newInvoice.name ?? null;
            formState.comment = newInvoice.comment ?? null;
            formState.status = newInvoice.status ?? "pending";
            formState.paidAt = newInvoice.paidAt ?? null;
        }
    }, { immediate: true });

    const { data, error, pending, execute } = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new AppError("Facture non chargée");
            }
            const parsed = UpdateInvoiceFormSchema.parse(formState);
            const command = toUpdateDetailsCommand(parsed);
            await $usecases.invoices.updateDetails.execute(
                command,
            );
            navigateTo("/app");
        },
    );

    return {
        updatedInvoice: data,
        error,
        pending,
        formRef,
        formState,
        paidAtInputRef,
        onSubmit: execute,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

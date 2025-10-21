import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { UpdateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";
import type { z } from "zod";
import type { UpdateInvoiceDetailsCommand } from "~~/shared/application/invoice/command";
import { AppError } from "~/core/errors/app.error";

// Mapping UI → Application command
const toUpdateDetailsCommand = (
    parsed: z.output<typeof UpdateInvoiceSchema>,
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

    const formState = reactive<Partial<z.input<typeof UpdateInvoiceSchema>>>(
        {},
    );

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                Object.assign(formState, {
                    id: newInvoice.id,
                    invoiceNumber: newInvoice.number ?? "",
                    emitDate: newInvoice.emitDate ?? new Date(),
                    dueDate: newInvoice.dueDate ?? new Date(),
                    amount: newInvoice.amount ?? 0,
                    name: newInvoice.name ?? null,
                    comment: newInvoice.comment ?? null,
                    paidAt: newInvoice.paidAt ?? null,
                    status: newInvoice.status,
                });
            }
        },
        { immediate: true },
    );

    const { data, error, pending, execute } = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new AppError("Facture non chargée");
            }
            const parsed = UpdateInvoiceSchema.parse(formState);
            const command = toUpdateDetailsCommand(parsed);
            const updated = await $usecases.invoices.updateDetails.execute(
                command,
            );
            Object.assign(invoice.value!, updated);
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

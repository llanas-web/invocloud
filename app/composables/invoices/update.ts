import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { UpdateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";
import type { z } from "zod";
import type { UpdateInvoiceDetailsCommand } from "~~/shared/application/invoice/commands";
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

    watch(invoice, (newInvoice) => {
        if (newInvoice) {
            Object.assign(formState, newInvoice.toUpdateForm());
        }
    }, { immediate: true });

    const { data, error, pending, execute } = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new AppError("Facture non chargée");
            }
            const parsed = UpdateInvoiceSchema.parse(formState);
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

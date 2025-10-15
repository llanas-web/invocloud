import { createSharedComposable } from "@vueuse/core";
import { format } from "date-fns";
import { z } from "zod";
import {
    type InvoiceModelUpdate,
    InvoiceStatus,
} from "~~/shared/models/invoice.model";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";

const amountField = z
    .union([z.string(), z.number()]) // <- input can be string|number
    .transform((v) => parseAmountFR(v)) // <- to number
    .pipe(z.number().positive("Le montant doit être positif.")); // <- validate

const formStateSchema: z.ZodType<InvoiceModelUpdate> = z.object({
    amount: amountField,
    comment: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    dueDate: z.date().nullable(),
    invoiceNumber: z.string().min(1, "Le numéro de facture est requis."),
    paidAt: z.date().optional().nullable(),
    createdAt: z.date(),
    status: z.enum(InvoiceStatus)
        .default(
            InvoiceStatus.VALIDATED,
        ),
}).refine((data) => {
    if (data.status === InvoiceStatus.PAID) {
        return data.paidAt !== null;
    }
    return true;
}, {
    message: "La date de paiement est requise lorsque le statut est 'payé'.",
});

const _useInvoiceUpdate = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const { getRepository } = DatabaseFactory.getInstance(supabaseClient);
    const invoiceRepository = getRepository("invoiceRepository");
    const { invoice } = useInvoiceDetails();

    const formRef = ref();
    const paidAtInputRef = ref();

    const formState = reactive<z.infer<typeof formStateSchema>>(invoice.value!);

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                Object.assign(formState, newInvoice);
            }
        },
        { immediate: true },
    );

    const { data, error, pending, execute } = useAsyncAction(
        async () => {
            if (!invoice.value?.id) {
                throw new Error("No invoice loaded.");
            }
            const parsed = formStateSchema.parse(formState);
            const _updatedInvoice = await invoiceRepository.updateInvoice(
                invoice.value.id,
                parsed,
            );
            Object.assign(invoice.value!, _updatedInvoice);
            navigateTo("/app");
        },
    );

    return {
        updatedInvoice: data,
        error,
        pending,
        formRef,
        formStateSchema,
        formState,
        paidAtInputRef,
        onSubmit: execute,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

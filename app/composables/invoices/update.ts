import type { UForm } from "#components";
import { createSharedComposable } from "@vueuse/core";
import { format } from "date-fns";
import { z } from "zod";
import type { InvoiceUpdate } from "~~/types";

const amountField = z
    .union([z.string(), z.number()]) // <- input can be string|number
    .transform((v) => parseAmountFR(v)) // <- to number
    .pipe(z.number().positive("Le montant doit être positif.")); // <- validate

const formStateSchema = z.object({
    amount: amountField,
    comment: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    due_date: z.string()
        .min(1, "La date d'échéance est requise.")
        .nullable()
        .refine((val) => val !== null && val.length > 0, {
            message: "La date d'échéance est requise.",
        }),
    invoice_number: z.string().min(1, "Le numéro de facture est requis."),
    paid_at: z.string().optional().nullable(),
    created_at: z.string().min(1, "La date de création est requise."),
    status: z.enum(["paid", "validated", "error", "pending", "sent"]).default(
        "validated",
    ),
}).refine((data) => {
    if (data.status === "paid") {
        return data.paid_at !== null;
    }
    return true;
}, {
    message: "La date de paiement est requise lorsque le statut est 'payé'.",
});

type Schema = z.input<typeof formStateSchema>;

const _useInvoiceUpdate = () => {
    const { invoice, updateInvoice } = useInvoiceDetails();
    const isLoading = ref(false);
    const toast = useToast();

    const formRef = ref();
    const paidAtInputRef = ref();

    const formState = reactive<Schema>({
        status: "validated",
        amount: invoice.value?.amount ?? 0,
        name: invoice.value?.name ?? "",
        invoice_number: invoice.value?.invoice_number ?? "",
        due_date: invoice.value?.due_date
            ? format(invoice.value?.due_date, "yyyy-MM-dd")
            : null,
        paid_at: invoice.value?.paid_at
            ? format(invoice.value?.paid_at, "yyyy-MM-dd")
            : null,
        created_at: format(
            invoice.value?.created_at ?? new Date(),
            "yyyy-MM-dd",
        ),
        comment: invoice.value?.comment ?? "",
    });

    watch(
        () => invoice.value,
        (newInvoice) => {
            if (newInvoice) {
                formState.status = newInvoice.status == "pending"
                    ? "validated"
                    : newInvoice.status ?? "validated";
                formState.amount = newInvoice.amount;
                formState.name = newInvoice.name;
                formState.invoice_number = newInvoice.invoice_number ?? "";
                formState.due_date = newInvoice.due_date
                    ? format(
                        newInvoice.due_date,
                        "yyyy-MM-dd",
                    )
                    : null;
                formState.paid_at = newInvoice.paid_at
                    ? format(
                        newInvoice.paid_at,
                        "yyyy-MM-dd",
                    )
                    : null;
                formState.created_at = format(
                    newInvoice.created_at,
                    "yyyy-MM-dd",
                );
                formState.comment = newInvoice.comment ?? "";
            }
        },
        { immediate: true },
    );

    const onSubmit = async () => {
        isLoading.value = true;
        if (invoice.value == null) {
            console.error("Invoice is not loaded");
            return;
        }
        const { success, error, data } = formStateSchema.safeParse(formState);
        if (!success || error) {
            console.error("Form validation failed:", error);
            toast.add({
                title: "Erreur",
                description:
                    "Le formulaire contient des erreurs. Veuillez vérifier les champs requis.",
                color: "error",
            });
            isLoading.value = false;
            return;
        }
        const updatedInvoice = await updateInvoice(
            invoice.value.id as string,
            data,
        );
        isLoading.value = false;
        if (!updatedInvoice) {
            console.error("Failed to save invoice");
            toast.add({
                title: "Erreur",
                description: "Échec de la mise à jour de la facture.",
                color: "error",
            });
            return;
        }
        toast.add({
            title: "Succès",
            description: "Facture mise à jour avec succès.",
            color: "success",
        });

        Object.assign(invoice.value!, formState);
        navigateTo("/app");
    };

    return {
        formRef,
        formStateSchema,
        formState,
        isLoading,
        paidAtInputRef,
        onSubmit,
    };
};

export const useInvoiceUpdate = createSharedComposable(_useInvoiceUpdate);

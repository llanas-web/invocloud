import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { z } from "zod";
import { CreateInvoiceSchema } from "~/types/schemas/forms/invoices.schema";
import type { CreateInvoiceCommand } from "~~/shared/application/invoice/usecases/create-invoice.usecase";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";
import type { FormError } from "@nuxt/ui";

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

const createByOcrSchema = z.object({
    supplierId: z.uuid({
        error: "Veuillez saisir un fournisseur pour envoyer en OCR",
    }),
    establishmentId: z.uuid(),
    file: z.instanceof(File),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.DRAFT),
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
        {
            successTitle: "Facture créée avec succès.",
            errorTitle: "Erreur lors de la création de la facture.",
        },
    );

    const createByOcrAction = useAsyncAction(
        async () => {
            const { data: command, success, error } = createByOcrSchema
                .safeParse({
                    supplierId: formState.supplierId!,
                    establishmentId: selectedId.value!,
                    file: invoiceFile.value!,
                    status: InvoiceStatus.DRAFT,
                });
            if (!success) {
                formRef.value?.setErrors(error.issues.map((issue) => ({
                    message: issue.message,
                    name: issue.path.join("."),
                })));
                return;
            }
            await $usecases.invoices.create.execute(command);
            navigateTo("/app");
        },
        {
            successTitle: "Facture envoyée en OCR avec succès.",
            errorTitle: "Erreur lors de l'envoi de la facture en OCR.",
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
        actions: {
            createByOcr: createByOcrAction,
        },
    };
};

export const useInvoiceCreate = createSharedComposable(_useInvoiceCreate);

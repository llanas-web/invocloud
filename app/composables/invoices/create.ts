import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import { parseAmountFR } from "~/utils/number";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import useAsyncAction from "../core/useAsyncAction";
import { InvoiceSource, InvoiceStatus } from "~~/shared/models/invoice.model";

const amountField = z.union([z.string(), z.number()])
    .transform(parseAmountFR)
    .pipe(z.number().positive("Le montant doit être positif."));

export const CreateInvoiceSchema = z.object({
    supplierId: z.uuid("Fournisseur invalide"),
    amount: amountField,
    filePath: z.string().min(1, "Fichier requis"),
    invoiceNumber: z.string().min(1, "Numéro requis"),
    name: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    dueDate: z.date().nullable().optional(), // Date en domaine
    paidAt: z.date().nullable().optional(),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),
    source: z.enum(InvoiceSource).default(InvoiceSource.APP),
});

export type CreateInvoiceForm = z.input<typeof CreateInvoiceSchema>; // pour le state
export type CreateInvoiceCommand = z.output<typeof CreateInvoiceSchema>; // pour le repo

const _useInvoiceCreate = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const supabaseUser = useSupabaseUser();
    const { getRepository } = DatabaseFactory.getInstance(supabaseClient);
    const invoiceRepository = getRepository("invoiceRepository");

    const formRef = ref();

    const formState = reactive<CreateInvoiceForm>({
        filePath: "",
        supplierId: "",
        amount: 0,
        comment: "",
        name: null,
        dueDate: null,
        invoiceNumber: "",
        paidAt: null,
        status: InvoiceStatus.VALIDATED,
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
            throw new Error("Not implemented");
            // await storageRepository.uploadFile({
            //     file: invoiceFile.value,
            //     path: `${selectedEstablishment.value!.id}/${newInvoiceId}`,
            //     type: "invoices",
            // });
            // await invoiceRepository.createInvoice(
            //     parsedInvoice,
            // );
            // navigateTo("/app");
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

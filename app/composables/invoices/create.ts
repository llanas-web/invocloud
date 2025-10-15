import { createSharedComposable } from "@vueuse/core";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import useAsyncAction from "../core/useAsyncAction";
import {
    type CreateInvoiceForm,
    CreateInvoiceSchema,
} from "~/types/schemas/forms/invoices.schema";
import { InvoiceStatus } from "~~/shared/models/invoice.model";

const _useInvoiceCreate = () => {
    const supabaseClient = useSupabaseClient<Database>();
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

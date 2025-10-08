import { createSharedComposable } from "@vueuse/core";
import createInvoiceRepository from "#shared/repositories/invoice.repository";
import type { InvoiceInsert, InvoiceUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";
import { acceptedStatus } from "~~/types/schemas/invoices";
import createStorageRepository from "#shared/repositories/storage.repository";

const _useInvoices = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const invoiceRepository = createInvoiceRepository(supabaseClient);
    const storageRepository = createStorageRepository(supabaseClient);
    const supabaseUser = useSupabaseUser();
    const { selectedEstablishment } = useEstablishments();

    const { data: invoices, error: invoicesError, refresh, pending } =
        useAsyncData(
            "invoices",
            async () => {
                const { data, error } = await invoiceRepository
                    .getInvoicesByEstablishment(
                        selectedEstablishment.value!.id,
                    );
                if (error || !data) {
                    return [];
                }
                return data;
            },
            {
                default: () => [],
                watch: [selectedEstablishment],
                lazy: true,
            },
        );

    const acceptedInvoices = computed(() =>
        invoices.value?.filter((i) => acceptedStatus.includes(i.status!)) || []
    );

    const pendingInvoices = computed(() =>
        invoices.value?.filter((i) =>
            i.status === "pending" || i.status === "ocr"
        ) || []
    );

    const getInvoices = async () => {
        await refresh();
    };

    const updateInvoice = async (invoiceId: string, invoice: InvoiceUpdate) => {
        if (!invoiceId || !invoice) {
            console.error(
                "Invoice ID and data are required to update an invoice.",
            );
            return null;
        }
        const { data, error } = await invoiceRepository.updateInvoice(
            invoiceId,
            invoice,
        );
        if (error) {
            return null;
        }
        await refresh();
        return data;
    };

    const createInvoice = async (invoice: InvoiceInsert, invoiceFile: File) => {
        if (!invoice) {
            console.error("Invoice data is required to create an invoice.");
            return null;
        }
        // generate id UUID
        invoice.id = crypto.randomUUID();

        const { data: uploadData, error: uploadError } = await storageRepository
            .uploadInvoiceFile(
                invoiceFile,
                `${selectedEstablishment.value!.id}/${invoice.id}`,
            );
        if (uploadError || !uploadData) {
            return null;
        }
        const { data, error } = await invoiceRepository.createInvoice([{
            ...invoice,
            file_path: uploadData.path,
        }]);
        if (error) {
            return null;
        }
        await refresh();
        return data;
    };

    const deleteInvoices = async (invoiceIds: string[]) => {
        if (!invoiceIds || invoiceIds.length === 0) {
            console.error("No invoice IDs provided for deletion.");
            return null;
        }
        for (const invoiceId of invoiceIds) {
            const { error: deleteError } = await storageRepository
                .removeInvoiceFile(
                    `${supabaseUser.value!.id}/${invoiceId}`,
                );
            if (deleteError) {
                return null;
            }
        }
        const { data, error } = await invoiceRepository.deleteInvoices(
            invoiceIds,
        );
        if (error) {
            return null;
        }
        await refresh();
        return true;
    };

    const sendInvoice = async (invoicesId: string[], email: string) => {
        if (!invoicesId || invoicesId.length === 0) {
            console.error("Invoice IDDs are required to send invoices.");
            return null;
        }
        const { message, success } = await $fetch<
            ReturnType<
                typeof import("~~/server/api/security/invoice/send.post").default
            >
        >(
            `/api/invoices/send`,
            {
                method: "POST",
                body: {
                    invoices: invoicesId,
                    email,
                },
            },
        );
        if (!success) {
            console.error("Error sending invoices:", message);
            return null;
        }
        return success;
    };

    const getInvoliceUrl = async (invoiceId: string) => {
        if (!invoiceId) {
            console.error("Invoice ID is required to get the invoice URL.");
            return null;
        }
        const { data, error } = await storageRepository.createSignedUrl(
            `${supabaseUser.value!.id}/${invoiceId}`,
            60,
        );
        if (error || !data) {
            return null;
        }
        return data.signedUrl;
    };

    const downloadInvoiceFile = async (filePath: string) => {
        console.log("Downloading invoice file from path:", filePath);
        const { data: blob, error } = await storageRepository
            .downloadInvoiceFile(filePath);

        if (error || !blob) throw error || new Error("No blob found");
        return blob;
    };

    return {
        invoices,
        acceptedInvoices,
        refresh,
        pending,
        invoicesError,
        pendingInvoices,
        getInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoices,
        sendInvoice,
        getInvoliceUrl,
        downloadInvoiceFile,
    };
};

export const useInvoices = createSharedComposable(_useInvoices);

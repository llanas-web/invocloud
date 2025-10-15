import { createSharedComposable } from "@vueuse/core";
import { acceptedStatus } from "~~/types/schemas/invoices";
import createStorageRepository from "~~/shared/providers/database/supabase/repositories/storage.repository";
import type { Database } from "~~/types/providers/database/supabase/database.types";
import DatabaseFactory from "~~/shared/providers/database/database-factory";

const _useInvoices = () => {
    const supabaseUser = useSupabaseUser();
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const invoiceRepository = getRepository("invoiceRepository");

    const { selectedEstablishment } = useEstablishments();
    const storageRepository = createStorageRepository(supabaseClient);

    const { data: invoices, error, refresh, pending } = useAsyncData(
        "invoices",
        async () => {
            const invoices = await invoiceRepository
                .getAllInvoices({
                    establishmentIds: [selectedEstablishment.value!.id],
                });
            return invoices;
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
        error,
        pendingInvoices,
        sendInvoice,
        getInvoliceUrl,
        downloadInvoiceFile,
    };
};

export const useInvoices = createSharedComposable(_useInvoices);

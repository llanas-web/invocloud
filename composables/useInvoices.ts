import { createSharedComposable } from "@vueuse/core";
import type {
    InvoiceInsert,
    InvoiceUpdate,
    InvoiceWithEstablishment,
} from "~/types";
import type { Database } from "~/types/database.types";
import {
    acceptedStatus,
    InvoiceWithEstablishmentSchema,
} from "~/types/schemas/invoices";

const _useInvoices = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const supabaseUser = useSupabaseUser();
    const { selectedEstablishment } = useEstablishments();

    const { data: invoices, error: invoicesError, refresh, pending } =
        useAsyncData(
            "invoices",
            async () => {
                const { data, error } = await supabaseClient
                    .from("invoices_with_establishment")
                    .select("*")
                    .eq(
                        "establishment_id",
                        selectedEstablishment.value!.id,
                    );
                if (error || !data) {
                    console.error("Error fetching invoices:", error);
                    return [];
                }
                const parsedData = InvoiceWithEstablishmentSchema.array()
                    .safeParse(
                        data,
                    );
                if (!parsedData.success) {
                    console.error(
                        "Error parsing invoices data:",
                        parsedData.error,
                    );
                    return [];
                }
                // If the establishment is not selected, return an empty array
                return parsedData.data;
            },
            {
                default: () => [],
            },
        );

    const acceptedInvoices = computed(() =>
        invoices.value?.filter((i) => acceptedStatus.includes(i.status!)) || []
    );

    watch(selectedEstablishment, (newEstablishment) => {
        if (!newEstablishment) {
            console.warn(
                "No establishment selected. Invoices will not be fetched.",
            );
            return;
        }
        // Refresh invoices when the selected establishment changes
        if (refresh) refresh();
    }, { immediate: true });

    const pendingInvoices = computed(() =>
        invoices.value.filter((invoice) => invoice.status === "pending")
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
        const { data, error } = await supabaseClient
            .from("invoices")
            .update(invoice)
            .eq("id", invoiceId)
            .select()
            .single();
        if (error) {
            console.error("Error updating invoice:", error);
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

        // Upload the invoice file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from("invoices")
            .upload(
                `${selectedEstablishment.value!.id}/${invoice.id}`,
                invoiceFile,
            );
        if (uploadError) {
            console.error("Error uploading invoice file:", uploadError);
            return null;
        }
        const { data, error } = await supabaseClient
            .from("invoices")
            .insert([{
                ...invoice,
                status: "validated",
                file_path: uploadData.path, // Store the file path
            }])
            .select()
            .single();

        if (error) {
            console.error("Error creating invoice:", error);
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
        // Delete the invoice files from Supabase Storage
        for (const invoiceId of invoiceIds) {
            const { error: deleteError } = await supabaseClient
                .storage
                .from("invoices")
                .remove([`${supabaseUser.value!.id}/${invoiceId}`]);
            if (deleteError) {
                console.error("Error deleting invoice file:", deleteError);
                return null;
            }
        }
        const { data, error } = await supabaseClient
            .from("invoices")
            .delete()
            .in("id", invoiceIds);
        if (error) {
            console.error("Error deleting invoices:", error);
            return null;
        }
        await refresh();
        return data;
    };

    const sendInvoice = async (invoices: string[], email: string) => {
        if (!invoices || invoices.length === 0) {
            console.error("Invoice IDDs are required to send invoices.");
            return null;
        }
        const { data, message, success } = await $fetch(
            `/api/send-invoices/`,
            {
                method: "POST",
                body: {
                    invoices: [invoices],
                    email,
                },
            },
        );
        if (!success) {
            console.error("Error sending invoices:", message);
            return null;
        }
        return data;
    };

    const getInvoliceUrl = async (invoiceId: string) => {
        if (!invoiceId) {
            console.error("Invoice ID is required to get the invoice URL.");
            return null;
        }
        const { data, error } = await supabaseClient.storage
            .from("invoices")
            .createSignedUrl(`${supabaseUser.value!.id}/${invoiceId}`, 60);
        if (error) {
            console.error("Error creating signed URL for invoice:", error);
            return null;
        }
        return data.signedUrl;
    };

    const downloadInvoiceFile = async (filePath: string) => {
        const { data: blob, error } = await supabaseClient.storage
            .from("invoices")
            .download(filePath);

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

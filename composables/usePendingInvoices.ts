import type { Database } from "~/types/database.types";
import { createSharedComposable } from "@vueuse/core";
import type { PendingInvoicesStatus } from "~/types";

const _usePendingInvoices = () => {
    const { refresh: refreshInvoices } = useInvoices();

    const { data: pendingInvoices, error, refresh, pending } = useAsyncData(
        "pending-invoices",
        async () => {
            const supabaseClient = useSupabaseClient<Database>();
            const supabaseUser = useSupabaseUser();
            const { data, error } = await supabaseClient
                .from("pending_invoices")
                .select(`
                    *,
                    stakeholder:stakeholders (*),
                    user:users (*)
                `)
                .eq("user_id", supabaseUser.value!.id)
                .neq("status", "validated");
            if (error) {
                console.error("Error fetching pending invoices:", error);
                return [];
            }
            return data;
        },
        {
            immediate: true,
            default: () => [],
        },
    );

    const updatePendingInvoice = async (
        invoiceId: string,
        status: PendingInvoicesStatus,
    ) => {
        if (!invoiceId || !status) {
            console.error(
                "Invoice ID and status are required to update a pending invoice.",
            );
            return null;
        }
        const supabaseClient = useSupabaseClient<Database>();
        const { data, error } = await supabaseClient
            .from("pending_invoices")
            .update({ status })
            .eq("id", invoiceId)
            .select()
            .single();
        if (error) {
            console.error("Error updating pending invoice:", error);
            return null;
        }
        await Promise.all([refresh(), refreshInvoices()]);
        return data;
    };

    return {
        pendingInvoices,
        error,
        refresh,
        pending,
        updatePendingInvoice,
    };
};

export const usePendingInvoices = createSharedComposable(_usePendingInvoices);

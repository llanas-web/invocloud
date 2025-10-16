import type { Database } from "~~/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceTasksStatus, InvoiceTaskUpdate } from "~/types";

const createInvoiceTaskRepository = (supabase: SupabaseClient<Database>) => {
    const getInvoiceTasks = async (
        status: InvoiceTasksStatus = "queued",
        maxAttempts: number = 5,
        limit: number = 25,
    ) => {
        const response = await supabase
            .from("invoice_jobs")
            .select("*, invoice:invoices(id, file_path)")
            .eq("status", status)
            .lt("attempts", maxAttempts)
            .order("created_at", { ascending: false })
            .limit(limit);
        if (response.error) {
            console.error("Error fetching invoice tasks:", response.error);
        }
        return response;
    };

    const updateInvoiceTask = async (
        id: string,
        updates: InvoiceTaskUpdate,
        idType: "id" | "job_id" = "id",
    ) => {
        const response = await supabase
            .from("invoice_jobs")
            .update(updates)
            .eq(idType, id)
            .select()
            .single();
        if (response.error) {
            console.error("Error updating invoice task:", response.error);
        }
        return response;
    };

    return {
        getInvoiceTasks,
        updateInvoiceTask,
    };
};

export default createInvoiceTaskRepository;

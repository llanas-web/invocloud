import {
    InvoiceTaskModel,
    InvoiceTaskStatus,
} from "~~/shared/types/models/invoice-task.model";
import type { InvoiceTaskRepository } from "../../database.interface";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { invoiceTaskMapperFromDatabase } from "../mapper/invoice-task.mapper";
import type { InvoiceTaskUpdate } from "~~/shared/types/providers/database";

export class InvoiceTaskSupabaseRepository implements InvoiceTaskRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    getInvoiceTasks = async (
        status: InvoiceTaskStatus = InvoiceTaskStatus.QUEUED,
        maxAttempts: number = 5,
        options?: { limit?: number },
    ) => {
        const request = this.supabase
            .from("invoice_jobs")
            .select("*, invoice:invoices(id, file_path)")
            .eq("status", status)
            .lt("attempts", maxAttempts)
            .order("created_at", { ascending: false });
        if (options?.limit) request.limit(options?.limit);

        const { data, error } = await request;
        if (error) {
            throw new Error(`Error fetching invoice tasks: ${error.message}`);
        }

        return data.map((task) => invoiceTaskMapperFromDatabase(task));
    };

    updateInvoiceTask = async (
        id: string,
        updates: InvoiceTaskUpdate,
        idType?: "id" | "job_id",
    ) => {
        const { data, error } = await this.supabase
            .from("invoice_jobs")
            .update(updates)
            .eq(idType ?? "id", id)
            .select("*")
            .single();

        if (error) {
            throw new Error(`Error updating invoice task: ${error.message}`);
        }

        return invoiceTaskMapperFromDatabase(data);
    };
}

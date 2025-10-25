import type { InvoiceTaskRepository } from "~~/shared/domain/invoice-task/invoice-task.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    InvoiceTaskModel,
    InvoiceTaskStatus,
    InvoiceTaskType,
} from "~~/shared/domain/invoice-task/invoice-task.model";
import type { Database } from "../../common/supabase/database.types";

export class InvoiceTaskSupabaseRepository implements InvoiceTaskRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    async create(task: InvoiceTaskModel): Promise<string> {
        const { data, error } = await this.supabase
            .from("invoice_jobs")
            .insert({
                invoice_id: task.invoiceId,
                type: task.type,
                status: task.status,
                provider: task.provider ?? "mindee",
                attempts: task.attempts,
                job_id: task.jobId,
                raw_result: task.rawResult,
            })
            .select("id")
            .single();

        if (error) {
            throw new Error(`Error creating invoice task: ${error.message}`);
        }

        return data.id;
    }

    async findById(id: string): Promise<InvoiceTaskModel | null> {
        const { data, error } = await this.supabase
            .from("invoice_jobs")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return this.mapToModel(data);
    }

    async findByJobId(jobId: string): Promise<InvoiceTaskModel | null> {
        const { data, error } = await this.supabase
            .from("invoice_jobs")
            .select("*")
            .eq("job_id", jobId)
            .single();

        if (error || !data) return null;

        return this.mapToModel(data);
    }

    async findByInvoiceId(invoiceId: string): Promise<InvoiceTaskModel[]> {
        const { data, error } = await this.supabase
            .from("invoice_jobs")
            .select("*")
            .eq("invoice_id", invoiceId)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(`Error fetching invoice tasks: ${error.message}`);
        }

        return data.map((task) => this.mapToModel(task));
    }

    async findPendingTasks(options?: {
        status?: InvoiceTaskStatus;
        type?: InvoiceTaskType;
        maxAttempts?: number;
        limit?: number;
    }): Promise<InvoiceTaskModel[]> {
        let query = this.supabase
            .from("invoice_jobs")
            .select("*");

        if (options?.status) {
            query = query.eq("status", options.status);
        }

        if (options?.type) {
            query = query.eq("type", options.type);
        }

        if (options?.maxAttempts) {
            query = query.lt("attempts", options.maxAttempts);
        }

        query = query.order("created_at", { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error fetching pending tasks: ${error.message}`);
        }

        return data.map((task) => this.mapToModel(task));
    }

    async update(task: InvoiceTaskModel): Promise<void> {
        const { error } = await this.supabase
            .from("invoice_jobs")
            .update({
                status: task.status,
                job_id: task.jobId,
                attempts: task.attempts,
                raw_result: task.rawResult,
                updated_at: task.updatedAt.toISOString(),
            })
            .eq("id", task.id);

        if (error) {
            throw new Error(`Error updating invoice task: ${error.message}`);
        }
    }

    private mapToModel(data: any): InvoiceTaskModel {
        return new InvoiceTaskModel({
            id: data.id,
            invoiceId: data.invoice_id,
            type: data.type,
            status: data.status,
            jobId: data.job_id,
            provider: data.provider,
            attempts: data.attempts,
            rawResult: data.raw_result,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at ?? data.created_at),
        });
    }
}

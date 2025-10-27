import type { StorageRepository } from "../../common/providers/storage/storage.repository";
import {
    InvoiceTaskStatus,
    InvoiceTaskType,
} from "~~/shared/domain/invoice-task/invoice-task.model";
import type { OcrRepository } from "../../common/providers/ocr/ocr.repository";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const ProcessPendingTasksCommandSchema = z.object({
    limit: z.number().optional().default(25),
    maxAttempts: z.number().default(5),
});
export type ProcessPendingTasksCommand = z.input<
    typeof ProcessPendingTasksCommandSchema
>;

export default class ProcessPendingTasksUsecase {
    constructor(
        private repos: Repositories,
        private queries: Queries,
        private storageRepository: StorageRepository,
        private ocrProvider: OcrRepository,
    ) {}

    async execute(command: ProcessPendingTasksCommand) {
        const parsed = ProcessPendingTasksCommandSchema.parse(command);

        const tasks = await this.repos.invoiceTasksRepo.findPendingTasks({
            status: InvoiceTaskStatus.QUEUED,
            type: InvoiceTaskType.OCR,
            maxAttempts: parsed.maxAttempts,
            limit: parsed.limit,
        });

        const results = await Promise.allSettled(
            tasks.map(async (task) => {
                try {
                    // Générer une URL signée pour le fichier
                    const invoice = await this.repos.invoicesRepo.getById(
                        task.invoiceId,
                    );
                    if (!invoice || !invoice.filePath) {
                        throw new Error("Invoice file not found");
                    }

                    const signedUrl = await this.storageRepository
                        .createSignedUrl(
                            "invoices",
                            invoice.filePath,
                            60,
                        );

                    // Soumettre à l'OCR
                    const result = await this.ocrProvider.submitUrl(signedUrl, {
                        invoiceId: task.invoiceId,
                    });

                    if (!result.jobId) {
                        throw new Error("Failed to submit to OCR provider");
                    }

                    // Mettre à jour la tâche
                    const submitedTask = task.submit(result.jobId);
                    await this.repos.invoiceTasksRepo.update(submitedTask);

                    return { taskId: task.id, jobId: result.jobId };
                } catch (error) {
                    console.error(`Error processing task ${task.id}:`, error);
                    const erroredTask = task.markAsError();
                    await this.repos.invoiceTasksRepo.update(erroredTask);
                    throw error;
                }
            }),
        );

        return {
            processed: results.filter((r) => r.status === "fulfilled").length,
            failed: results.filter((r) => r.status === "rejected").length,
            total: tasks.length,
        };
    }
}

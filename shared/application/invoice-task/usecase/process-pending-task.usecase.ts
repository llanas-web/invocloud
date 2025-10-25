import type { InvoiceTaskRepository } from "~~/shared/domain/invoice-task/invoice-task.repository";
import type { StorageRepository } from "../../common/providers/storage/storage.repository";
import {
    InvoiceTaskStatus,
    InvoiceTaskType,
} from "~~/shared/domain/invoice-task/invoice-task.model";
import type { OcrRepository } from "../../common/providers/ocr/ocr.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { ProcessPendingTasksCommandSchema } from "../commands";

export class ProcessPendingTasksUsecase {
    constructor(
        private invoiceTaskRepository: InvoiceTaskRepository,
        private invoiceRepository: InvoiceRepository,
        private storageRepository: StorageRepository,
        private ocrProvider: OcrRepository,
    ) {}

    async execute(raw?: { limit?: number; maxAttempts?: number }) {
        const parsed = ProcessPendingTasksCommandSchema.parse(raw);

        const tasks = await this.invoiceTaskRepository.findPendingTasks({
            status: InvoiceTaskStatus.QUEUED,
            type: InvoiceTaskType.OCR,
            maxAttempts: parsed.maxAttempts,
            limit: parsed.limit,
        });

        const results = await Promise.allSettled(
            tasks.map(async (task) => {
                try {
                    // Générer une URL signée pour le fichier
                    const invoice = await this.invoiceRepository.getById(
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
                    task.submit(result.jobId);
                    await this.invoiceTaskRepository.update(task);

                    return { taskId: task.id, jobId: result.jobId };
                } catch (error) {
                    console.error(`Error processing task ${task.id}:`, error);
                    task.markAsError();
                    await this.invoiceTaskRepository.update(task);
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

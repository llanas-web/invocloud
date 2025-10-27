import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const ProcessOcrWebhookCommandSchema = z.object({
    jobId: z.string(),
    isValid: z.boolean(),
    prediction: z.object({
        invoiceNumber: z.string().optional(),
        totalTtc: z.number().optional(),
        dueDate: z.string().optional(),
    }).optional(),
    rawResult: z.unknown(),
});
export type ProcessOcrWebhookCommand = z.input<
    typeof ProcessOcrWebhookCommandSchema
>;

export default class ProcessOcrWebhookUsecase {
    constructor(
        private repos: Repositories,
        private queries: Queries,
    ) {}

    async execute(command: ProcessOcrWebhookCommand) {
        const parsed = ProcessOcrWebhookCommandSchema.parse(command);
        // Trouver la tâche par jobId
        const task = await this.repos.invoiceTasksRepo.findByJobId(
            parsed.jobId,
        );
        if (!task) {
            throw new Error("Task not found");
        }

        // Vérifier si la tâche est valide
        if (!parsed.isValid) {
            throw new Error("Invalid webhook");
        }

        // Récupérer la facture
        const invoice = await this.repos.invoicesRepo.getById(task.invoiceId);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        if (!parsed.prediction || !parsed.isValid) {
            // Marquer la tâche comme erreur
            const erroredTask = task.markAsError();
            await this.repos.invoiceTasksRepo.update(erroredTask);

            // Mettre à jour le statut de la facture
            const updatedInvoice = invoice.changeStatus(InvoiceStatus.ERROR);
            await this.repos.invoicesRepo.update(updatedInvoice);

            throw new Error("Invalid webhook payload");
        }

        // Marquer la tâche comme terminée
        const rawResult = typeof parsed.rawResult === "object"
            ? JSON.stringify(parsed.rawResult)
            : String(parsed.rawResult);
        const doneTask = task.markAsDone(rawResult);
        await this.repos.invoiceTasksRepo.update(doneTask);

        // Mettre à jour la facture avec les données OCR
        const updatedInvoice = invoice.withDetails({
            number: parsed.prediction.invoiceNumber ?? undefined,
            amount: parsed.prediction.totalTtc ?? undefined,
            dueDate: parsed.prediction.dueDate
                ? new Date(parsed.prediction.dueDate)
                : undefined,
        }).changeStatus(InvoiceStatus.PENDING);
        await this.repos.invoicesRepo.update(updatedInvoice);

        return task.id;
    }
}

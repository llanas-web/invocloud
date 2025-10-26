import type { InvoiceTaskRepository } from "~~/shared/domain/invoice-task/invoice-task.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { ProcessOcrWebhookCommandSchema } from "../commands";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

export class ProcessOcrWebhookUsecase {
    constructor(
        private invoiceTaskRepository: InvoiceTaskRepository,
        private invoiceRepository: InvoiceRepository,
    ) {}

    async execute(raw: unknown) {
        const parsed = ProcessOcrWebhookCommandSchema.parse(raw);
        // Trouver la tâche par jobId
        const task = await this.invoiceTaskRepository.findByJobId(parsed.jobId);
        if (!task) {
            throw new Error("Task not found");
        }

        // Vérifier si la tâche est valide
        if (!parsed.isValid) {
            throw new Error("Invalid webhook");
        }

        // Récupérer la facture
        const invoice = await this.invoiceRepository.getById(task.invoiceId);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        if (!parsed.prediction || !parsed.isValid) {
            // Marquer la tâche comme erreur
            const erroredTask = task.markAsError();
            await this.invoiceTaskRepository.update(erroredTask);

            // Mettre à jour le statut de la facture
            const updatedInvoice = invoice.changeStatus(InvoiceStatus.ERROR);
            await this.invoiceRepository.update(updatedInvoice);

            throw new Error("Invalid webhook payload");
        }

        // Marquer la tâche comme terminée
        const rawResult = typeof parsed.rawResult === "object"
            ? JSON.stringify(parsed.rawResult)
            : String(parsed.rawResult);
        const doneTask = task.markAsDone(rawResult);
        await this.invoiceTaskRepository.update(doneTask);

        // Mettre à jour la facture avec les données OCR
        const updatedInvoice = invoice.withDetails({
            number: parsed.prediction.invoiceNumber ?? undefined,
            amount: parsed.prediction.totalTtc ?? undefined,
            dueDate: parsed.prediction.dueDate
                ? new Date(parsed.prediction.dueDate)
                : undefined,
        }).changeStatus(InvoiceStatus.PENDING);
        await this.invoiceRepository.update(updatedInvoice);

        return task.id;
    }
}

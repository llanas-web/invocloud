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
            task.markAsError();
            await this.invoiceTaskRepository.update(task);

            // Mettre à jour le statut de la facture
            invoice.changeStatus(InvoiceStatus.ERROR);
            await this.invoiceRepository.update(invoice);

            throw new Error("Invalid webhook payload");
        }

        // Marquer la tâche comme terminée
        const rawResult = typeof parsed.rawResult === "object"
            ? JSON.stringify(parsed.rawResult)
            : String(parsed.rawResult);
        task.markAsDone(rawResult);
        await this.invoiceTaskRepository.update(task);

        // Mettre à jour la facture avec les données OCR
        invoice.withDetails({
            number: parsed.prediction.invoiceNumber ?? undefined,
            amount: parsed.prediction.totalTtc ?? undefined,
            dueDate: parsed.prediction.dueDate
                ? new Date(parsed.prediction.dueDate)
                : undefined,
        });

        invoice.changeStatus(InvoiceStatus.PENDING);
        await this.invoiceRepository.update(invoice);

        return task.id;
    }
}

import type { InvoiceTaskRepository } from "~~/shared/domain/invoice-task/invoice-task.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import {
    InvoiceTaskModel,
    OcrProviderName,
} from "~~/shared/domain/invoice-task/invoice-task.model";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";
import { CreateOcrTaskCommandSchema } from "../commands";

export class CreateOcrTaskUsecase {
    constructor(
        private invoiceTaskRepository: InvoiceTaskRepository,
        private invoiceRepository: InvoiceRepository,
    ) {}

    async execute(raw: unknown) {
        const parsed = CreateOcrTaskCommandSchema.parse(raw);

        // Vérifier que la facture existe
        const invoice = await this.invoiceRepository.getById(parsed.invoiceId);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        // Créer la tâche OCR
        const task = InvoiceTaskModel.createOcrTask({
            invoiceId: parsed.invoiceId,
            provider: parsed.provider as OcrProviderName,
        });

        const taskId = await this.invoiceTaskRepository.create(task);

        // Mettre à jour le statut de la facture
        const updatedInvoice = invoice.changeStatus(InvoiceStatus.OCR);
        await this.invoiceRepository.update(updatedInvoice);

        return taskId;
    }
}

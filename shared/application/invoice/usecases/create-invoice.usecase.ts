import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { CreateInvoiceCommandSchema } from "../commands";
import {
    InvoiceModel,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

export class CreateInvoiceUsecase {
    constructor(private repo: InvoiceRepository) {}

    async execute(raw: unknown) {
        const input = CreateInvoiceCommandSchema.parse(raw);
        const entity = InvoiceModel.createDraft({
            status: InvoiceStatus.PENDING,
            supplierId: input.supplierId,
            name: input.name,
            amount: input.amount,
            emitDate: input.emitDate,
            dueDate: input.dueDate ?? null,
            paidAt: null,
            comment: input.comment ?? null,
            filePath: input.filePath,
            source: input.source,
        });
        const newInvoice = await this.repo.create(entity);
        return newInvoice;
    }
}

import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { DeleteInvoicesSchema } from "../commands";

export class DeleteInvoicesUsecase {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const invoiceIds = DeleteInvoicesSchema.parse(raw);
        await this.invoiceRepository.deleteMany(invoiceIds);
    }
}

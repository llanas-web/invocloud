import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { DeleteInvoicesSchema } from "../command";

export class DeleteInvoicesUsecase {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const invoiceIds = DeleteInvoicesSchema.parse(raw);
        for (const id of invoiceIds) {
            const invoice = await this.invoiceRepository.getById(id);
            if (!invoice) continue;
            await this.invoiceRepository.deleteInvoices([id]);
        }
    }
}

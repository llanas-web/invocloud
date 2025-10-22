import { z } from "zod";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";

export class GetInvoiceDetailsUsecase {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
    ) {}

    async execute(id: unknown) {
        const parsedId = z.uuid().parse(id);
        return this.invoiceRepository.getById(parsedId);
    }
}

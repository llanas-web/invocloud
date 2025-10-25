import { z } from "zod";
import type { InvoiceQuery } from "../invoice.query";

export class GetInvoiceDetailsUsecase {
    constructor(
        private readonly invoiceQuery: InvoiceQuery,
    ) {}

    async execute(id: unknown) {
        const parsedId = z.uuid().parse(id);
        return this.invoiceQuery.getInvoiceDetails(parsedId);
    }
}

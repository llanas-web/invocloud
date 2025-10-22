import { InvoiceListQuerySchema } from "../query";
import type { InvoiceQuery } from "../invoice.query";
import type { InvoiceListItemDTO } from "../dto";

export class ListInvoicesUsecase {
    constructor(private readonly invoiceQuery: InvoiceQuery) {}

    async execute(filters?: unknown): Promise<InvoiceListItemDTO[]> {
        const _filters = filters === undefined
            ? undefined
            : InvoiceListQuerySchema.parse(filters);

        return this.invoiceQuery.listInvoices(_filters);
    }
}

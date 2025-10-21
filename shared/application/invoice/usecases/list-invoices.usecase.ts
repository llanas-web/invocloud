import { InvoiceListQuerySchema } from "../query";
import type {
    InvoiceListItemDTO,
    InvoiceListQuery,
} from "../queries/invoice-list.query";

export class ListInvoicesUsecase {
    constructor(private readonly invoiceListQuery: InvoiceListQuery) {}

    async execute(filters?: unknown): Promise<InvoiceListItemDTO[]> {
        const _filters = filters === undefined
            ? undefined
            : InvoiceListQuerySchema.parse(filters);

        return this.invoiceListQuery.execute(_filters);
    }
}

import type { InvoiceDetailsDTO, InvoiceListItemDTO } from "./dto";
import type { InvoiceListQuery } from "./query";

export interface InvoiceQuery {
    listInvoices(
        filters?: InvoiceListQuery,
    ): Promise<InvoiceListItemDTO[]>;

    getInvoiceDetails(id: string): Promise<InvoiceDetailsDTO | null>;
}

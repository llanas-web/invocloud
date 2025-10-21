import type { InvoiceListQuery } from "~~/shared/application/invoice/queries/invoice-list.query";

export interface QueryFactory {
    invoiceListQuery(): InvoiceListQuery;
}

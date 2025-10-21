import type { EstablishmentListQuery } from "~~/shared/application/establishment/queries/establishment-list.query";
import type { InvoiceListQuery } from "~~/shared/application/invoice/queries/invoice-list.query";

export interface QueryFactory {
    invoiceListQuery(): InvoiceListQuery;
    establishmentListQuery(): EstablishmentListQuery;
}

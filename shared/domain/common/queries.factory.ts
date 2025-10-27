import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";
import type { InvoiceQuery } from "~~/shared/application/invoice/invoice.query";
import type { SupplierQuery } from "~~/shared/application/supplier/supplier.query";
import type { UserQuery } from "~~/shared/application/user/user.query";

export interface Queries {
    invoiceQuery: InvoiceQuery;
    establishmentQuery: EstablishmentQuery;
    suppliersQuery: SupplierQuery;
    userQuery: UserQuery;
}

export interface QueriesFactory {
    readonly queries: Queries;
}

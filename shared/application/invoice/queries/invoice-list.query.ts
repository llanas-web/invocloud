import type {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import type { InvoiceListItemDTO } from "../dto";

export type InvoiceListFilter = {
    ids?: string[];
    supplierIds?: string[];
    establishmentIds?: string[];
    status?: InvoiceStatus[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
};

export interface InvoiceListQuery {
    execute(filters?: InvoiceListFilter): Promise<InvoiceListItemDTO[]>;
}

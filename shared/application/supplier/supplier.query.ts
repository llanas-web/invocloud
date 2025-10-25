import type { SupplierListItemDTO } from "./dto";

export type SupplierListFilter = {
    establishmentIds?: string[];
    emails?: string[];
};

export interface SupplierQuery {
    listSuppliers(filters?: SupplierListFilter): Promise<SupplierListItemDTO[]>;
}

import type { SupplierListItemDTO } from "./dto";

export type SupplierListFilter = {
    establishmentIds?: string[];
};

export interface SupplierQuery {
    listSuppliers(filters?: SupplierListFilter): Promise<SupplierListItemDTO[]>;
}

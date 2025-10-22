import type { DraftSupplier, SupplierModel } from "./supplier.model";

export interface SupplierRepository {
    getById(id: string): Promise<SupplierModel | null>;
    create(entity: DraftSupplier): Promise<string>;
    update(entity: SupplierModel): Promise<void>;
    deleteMany(supplierIds: string[]): Promise<void>;
}

import type { SupplierModel } from "~~/shared/domain/supplier/supplier.model";

export class SupplierViewModel {
    constructor(private supplier: SupplierModel) {}

    get id() {
        return this.supplier.id;
    }
    get name() {
        return this.supplier.name;
    }
    get emails() {
        return this.supplier.emails;
    }
    get phone() {
        return this.supplier.phone;
    }
}

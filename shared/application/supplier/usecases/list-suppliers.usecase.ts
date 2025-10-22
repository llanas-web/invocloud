import type { SupplierListItemDTO } from "../dto";
import { ListSuppliersQueryFilterSchema } from "../queries";
import type { SupplierQuery } from "../supplier.query";

export class ListSuppliersUsecase {
    constructor(
        private readonly supplierQuery: SupplierQuery,
    ) {}

    async execute(
        filters?: unknown,
    ): Promise<SupplierListItemDTO[]> {
        const _filters = filters === undefined
            ? undefined
            : ListSuppliersQueryFilterSchema.parse(filters);
        return this.supplierQuery.listSuppliers(_filters);
    }
}

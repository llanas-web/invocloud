import { z } from "zod";
import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";

export class GetSupplierDetailsUsecase {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(id: unknown) {
        const parsedId = z.uuid().parse(id);
        return this.supplierRepository.getById(parsedId);
    }
}

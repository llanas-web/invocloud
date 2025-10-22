import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";
import { CreateSupplierSchema } from "../commands";

export class CreateSupplierUsecase {
    constructor(private readonly supplierRepository: SupplierRepository) {}

    async execute(raw: unknown) {
        const {
            name,
            establishmentId,
            emails,
        } = CreateSupplierSchema.parse(raw);
        return this.supplierRepository.create({
            name,
            establishmentId,
            emails,
        });
    }
}

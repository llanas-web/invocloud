import z from "zod";
import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";

export class DeleteSupplierUseCase {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(id: unknown): Promise<void> {
        const parsed = z.uuid().parse(id);
        await this.supplierRepository.delete(parsed);
    }
}

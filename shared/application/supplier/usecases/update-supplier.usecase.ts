import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";
import { UpdateSupplierDetailsSchema } from "../commands";
import { ApplicationError } from "../../common/errors/application.error";

export class UpdateSupplierUsecase {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(raw: unknown) {
        const parsedData = UpdateSupplierDetailsSchema.parse(raw);
        const existingSupplier = await this.supplierRepository.getById(
            parsedData.id,
        );
        if (!existingSupplier) throw new ApplicationError("Supplier not found");
        const updatedSupplier = existingSupplier.withDetails({
            name: parsedData.name ?? undefined,
            emails: parsedData.emails ?? undefined,
            phone: parsedData.phone ?? undefined,
        });
        return this.supplierRepository.update(updatedSupplier);
    }
}

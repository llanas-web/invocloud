import { ApplicationError } from "../../common/errors/application.error";
import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const UpdateSupplierDetailsSchema = z.object({
    id: z.uuid(),
    name: z.string().nullable().optional(),
    emails: z.array(z.email()).nullable().optional(),
    phone: z.string().nullable().optional(),
});
export type UpdateSupplierDetailsCommand = z.input<
    typeof UpdateSupplierDetailsSchema
>;

export default class UpdateSupplierUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: UpdateSupplierDetailsCommand) {
        const parsed = UpdateSupplierDetailsSchema.parse(command);
        const existingSupplier = await this.repos.suppliersRepo.getById(
            parsed.id,
        );
        if (!existingSupplier) throw new ApplicationError("Supplier not found");
        const updatedSupplier = existingSupplier.withDetails({
            name: parsed.name ?? undefined,
            emails: parsed.emails ?? undefined,
            phone: parsed.phone ?? undefined,
        });
        return this.repos.suppliersRepo.update(updatedSupplier);
    }
}

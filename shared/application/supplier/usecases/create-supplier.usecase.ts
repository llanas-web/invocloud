import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const CreateSupplierCommandSchema = z.object({
    establishmentId: z.uuid(),
    name: z.string().min(1),
    emails: z.array(z.email()).default([]),
});
export type CreateSupplierCommand = z.input<
    typeof CreateSupplierCommandSchema
>;

export default class CreateSupplierUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: CreateSupplierCommand) {
        const parsed = CreateSupplierCommandSchema.parse(command);
        const {
            name,
            establishmentId,
            emails,
        } = parsed;
        return this.repos.suppliersRepo.create({
            name,
            establishmentId,
            emails,
        });
    }
}

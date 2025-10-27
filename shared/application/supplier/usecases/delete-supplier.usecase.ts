import z from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const DeleteSupplierCommandSchema = z.object({
    id: z.uuid(),
});
export type DeleteSupplierCommand = z.input<
    typeof DeleteSupplierCommandSchema
>;

export default class DeleteSupplierUseCase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: DeleteSupplierCommand): Promise<void> {
        const parsed = DeleteSupplierCommandSchema.parse(command);
        await this.repos.suppliersRepo.delete(parsed.id);
    }
}

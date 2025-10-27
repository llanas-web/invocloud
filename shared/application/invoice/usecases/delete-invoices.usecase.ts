import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const DeleteInvoicesCommandSchema = z.object({
    invoiceIds: z.array(z.uuid()).nonempty(),
});
export type DeleteInvoicesCommand = z.input<typeof DeleteInvoicesCommandSchema>;

export default class DeleteInvoicesUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: DeleteInvoicesCommand) {
        const parsed = DeleteInvoicesCommandSchema.parse(command);
        await this.repos.invoicesRepo.deleteMany(parsed.invoiceIds);
    }
}

import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import { ApplicationError } from "../../common/errors/application.error";

export const DeleteEstablishmentCommandSchema = z.object({
    establishmentId: z.uuid(),
});
export type DeleteEstablishmentCommand = z.input<
    typeof DeleteEstablishmentCommandSchema
>;

export default class DeleteEstablishmentUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: DeleteEstablishmentCommand) {
        const parsed = DeleteEstablishmentCommandSchema.parse(command);
        const { establishmentId } = parsed;
        const establishment = await this.repos.establishmentsRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError(
                "Établissement introuvable",
            );
        }

        if (!establishment.canBeDeleted()) {
            throw new ApplicationError(
                "Cet établissement ne peut pas être supprimé car un abonnement est actif",
            );
        }

        await this.repos.establishmentsRepo.delete(establishmentId);
    }
}

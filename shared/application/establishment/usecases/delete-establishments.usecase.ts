import { z } from "zod";
import {
    DomainError,
    DomainErrorCode,
} from "~~/shared/domain/common/errors/domain.error";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

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
            throw new DomainError(
                DomainErrorCode.NO_ESTABLISHMENT,
                "Établissement introuvable",
            );
        }

        if (!establishment.canBeDeleted()) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "Cet établissement ne peut pas être supprimé",
            );
        }

        await this.repos.establishmentsRepo.delete(establishmentId);
    }
}

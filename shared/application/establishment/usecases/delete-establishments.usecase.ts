import { z } from "zod";
import {
    DomainError,
    DomainErrorCode,
} from "~~/shared/domain/common/errors/domain.error";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export class DeleteEstablishmentUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(raw: unknown) {
        const establishmentId = z.uuid().parse(raw);
        const establishment = await this.establishmentRepository.getById(
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

        await this.establishmentRepository.delete(establishmentId);
    }
}

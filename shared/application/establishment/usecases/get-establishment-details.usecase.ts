import { z } from "zod";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export class GetEstablishmentDetailsUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(id: unknown) {
        const parsedId = z.uuid().parse(id);
        return this.establishmentRepository.getById(parsedId);
    }
}

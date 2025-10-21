import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { DeleteEstablishmentsCommandSchema } from "../commands";

export class DeleteEstablishmentUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(raw: unknown) {
        const establishmentIds = DeleteEstablishmentsCommandSchema.parse(raw);
        await this.establishmentRepository.deleteMany(establishmentIds);
    }
}

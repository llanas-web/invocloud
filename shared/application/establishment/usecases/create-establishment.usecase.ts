import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { CreateEstablishmentCommandSchema } from "../command";
import { EstablishmentModel } from "~~/shared/domain/establishment/establishment.model";

export class CreateEstablishmentUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(raw: unknown) {
        const input = CreateEstablishmentCommandSchema.parse(raw);
        const entity = EstablishmentModel.createDraft({
            name: input.name,
            creatorId: input.creatorId,
            emailPrefix: input.emailPrefix,
            address: input.address,
            phone: input.phone,
        });
        const newEstablishment = await this.establishmentRepository.create(
            entity,
        );
        return newEstablishment;
    }
}

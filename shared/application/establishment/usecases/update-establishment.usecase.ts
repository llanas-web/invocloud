import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { UpdateEstablishmentCommandSchema } from "../commands";

export class UpdateEstablishmentUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(raw: unknown) {
        const parsed = UpdateEstablishmentCommandSchema.parse(raw);
        const establishment = await this.establishmentRepository.getById(
            parsed.id,
        );
        if (!establishment) throw new Error("Establishment not found");
        const updatedEstablishment = establishment.withDetails({
            name: parsed.name ?? undefined,
            emailPrefix: parsed.emailPrefix ?? undefined,
            address: parsed.address ?? undefined,
            phone: parsed.phone ?? undefined,
        });
        await this.establishmentRepository.update(updatedEstablishment);
        return updatedEstablishment.id;
    }
}

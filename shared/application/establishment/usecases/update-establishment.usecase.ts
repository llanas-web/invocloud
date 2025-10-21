import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { UpdateEstablishmentCommandSchema } from "../commands";

export class UpdateEstablishmentUsecase {
    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
    ) {}

    async execute(raw: unknown) {
        const cmd = UpdateEstablishmentCommandSchema.parse(raw);
        const entity = await this.establishmentRepository.getById(cmd.id);
        if (!entity) throw new Error("Establishment not found");
        const next = entity.withDetails({
            name: cmd.name ?? undefined,
            emailPrefix: cmd.emailPrefix ?? undefined,
            address: cmd.address ?? undefined,
            phone: cmd.phone ?? undefined,
        });
        await this.establishmentRepository.update(next);
        return next.id;
    }
}

import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export const UpdateEstablishmentCommandSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    emailPrefix: z.string().min(1).max(100).optional(),
    address: z.string().min(1).max(500).optional(),
    phone: z.string().min(1).max(20).optional(),
});
export type UpdateEstablishmentCommand = z.input<
    typeof UpdateEstablishmentCommandSchema
>;

export default class UpdateEstablishmentUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: UpdateEstablishmentCommand) {
        const parsed = UpdateEstablishmentCommandSchema.parse(command);
        const establishment = await this.repos.establishmentsRepo.getById(
            parsed.id,
        );
        if (!establishment) throw new Error("Establishment not found");
        const updatedEstablishment = establishment.withDetails({
            name: parsed.name ?? undefined,
            emailPrefix: parsed.emailPrefix ?? undefined,
            address: parsed.address ?? undefined,
            phone: parsed.phone ?? undefined,
        });
        await this.repos.establishmentsRepo.update(updatedEstablishment);
        return updatedEstablishment.id;
    }
}

import { z } from "zod";
import { EstablishmentModel } from "~~/shared/domain/establishment/establishment.model";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { AuthRepository } from "../../common/providers/auth/auth.repository";

export const CreateEstablishmentCommandSchema = z.object({
    creatorId: z.uuid(),
    name: z.string().min(1).max(255),
    emailPrefix: z.string().min(1).max(100),
    address: z.string().min(1).max(500).optional(),
    phone: z.string().min(1).max(20).optional(),
});
export type CreateEstablishmentCommand = z.input<
    typeof CreateEstablishmentCommandSchema
>;

export default class CreateEstablishmentUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: CreateEstablishmentCommand) {
        const parsed = CreateEstablishmentCommandSchema.parse(command);
        const draftEstablishment = EstablishmentModel.createDraft({
            name: parsed.name,
            creatorId: parsed.creatorId,
            emailPrefix: parsed.emailPrefix,
            address: parsed.address,
            phone: parsed.phone,
        });
        const newEstablishmentId = await this.repos.establishmentsRepo.create(
            draftEstablishment,
        );
        return newEstablishmentId;
    }
}

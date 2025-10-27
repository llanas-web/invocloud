import { ApplicationError } from "../../common/errors/application.error";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const ToggleFavoriteEstablishmentCommandSchema = z.object({
    userId: z.uuid(),
    establishmentId: z.uuid(),
});
export type ToggleFavoriteEstablishmentCommand = z.input<
    typeof ToggleFavoriteEstablishmentCommandSchema
>;

export default class ToggleFavoriteUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: ToggleFavoriteEstablishmentCommand): Promise<void> {
        const parsed = ToggleFavoriteEstablishmentCommandSchema.parse(command);
        const { userId, establishmentId } = parsed;
        const user = await this.repos.userRepo.getById(userId);
        if (!user) throw new ApplicationError("User not found");

        const updatedUser = user.toggleFavoriteEstablishment(establishmentId);
        await this.repos.userRepo.update(updatedUser);
    }
}

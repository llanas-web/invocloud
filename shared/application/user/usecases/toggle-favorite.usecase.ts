import type { UserRepository } from "~~/shared/domain/user/user.repository";
import { ApplicationError } from "../../common/errors/application.error";
import { ToggleFavoriteEstablishmentSchema } from "../commant";

export class ToggleFavoriteUsecase {
    constructor(
        private readonly userRepository: UserRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const parsed = ToggleFavoriteEstablishmentSchema.parse(raw);
        const { userId, establishmentId } = parsed;
        const user = await this.userRepository.getById(userId);
        if (!user) throw new ApplicationError("User not found");

        const updatedUser = user.toggleFavoriteEstablishment(establishmentId);
        await this.userRepository.update(updatedUser);
    }
}

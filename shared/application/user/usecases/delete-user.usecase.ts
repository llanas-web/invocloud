import type { UserRepository } from "~~/shared/domain/user/user.repository";
import { ApplicationError } from "../../common/errors/application.error";
import type { EstablishmentQuery } from "../../establishment/establishment.query";

export class DeleteUserUsecase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly establishmentQueries: EstablishmentQuery,
    ) {}

    async execute(userId: string): Promise<void> {
        const hasEstablishments = await this.establishmentQueries
            .hasAnyByCreatorId(
                userId,
            );
        if (hasEstablishments) {
            throw new ApplicationError(
                "Cannot delete user with associated establishments",
            );
        }
        await this.userRepository.delete(userId);
    }
}

import { ApplicationError } from "../../common/errors/application.error";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const DeleteUserCommandSchema = z.object({
    userId: z.uuid(),
});
export type DeleteUserCommand = z.input<
    typeof DeleteUserCommandSchema
>;

export default class DeleteUserUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: DeleteUserCommand): Promise<void> {
        const parsed = DeleteUserCommandSchema.parse(command);
        const { userId } = parsed;
        const hasEstablishments = await this.queries.establishmentQuery
            .hasAnyByCreatorId(
                userId,
            );
        if (hasEstablishments) {
            throw new ApplicationError(
                "Impossible de supprimer l'utilisateur car il est créateur d'au moins un établissement",
            );
        }
        await this.repos.userRepo.delete(userId);
    }
}

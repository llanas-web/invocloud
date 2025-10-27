import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { UserRepository } from "~~/shared/domain/user/user.repository";

export const UpdateUserDetailsCommandSchema = z.object({
    id: z.uuid(),
    fullName: z.string().min(1).optional(),
});
export type UpdateUserDetailsCommand = z.input<
    typeof UpdateUserDetailsCommandSchema
>;

export default class UpdateUserUseCase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: UpdateUserDetailsCommand): Promise<void> {
        const parsed = UpdateUserDetailsCommandSchema.parse(command);
        const user = await this.repos.userRepo.getById(parsed.id);
        if (!user) {
            throw new Error("User not found");
        }
        const updatedUser = user.withDetails({
            fullName: parsed.fullName ?? undefined,
        });
        return await this.repos.userRepo.update(updatedUser);
    }
}

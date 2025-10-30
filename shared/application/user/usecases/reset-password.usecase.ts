import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { AuthRepository } from "../../common/providers/auth/auth.repository";
import { z } from "zod";
import type { AdminRepository } from "../../common/providers/auth/admin.repository";

export const ResetPasswordCommandSchema = z.object({
    userId: z.uuid(),
    newPassword: z.string().min(8).max(128),
});
export type ResetPasswordCommand = z.input<
    typeof ResetPasswordCommandSchema
>;

export default class ResetPasswordUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly adminRepository: AdminRepository,
    ) {}

    async execute(command: ResetPasswordCommand) {
        // Validate and reset the user's password
        const parsed = ResetPasswordCommandSchema.parse(command);
        const { userId, newPassword } = parsed;
        await this.adminRepository.updateUser(userId, {
            password: newPassword,
        });
    }
}

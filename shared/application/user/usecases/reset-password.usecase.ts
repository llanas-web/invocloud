import type { AuthRepository } from "../../common/providers/auth/auth.repository";

export class ResetPasswordUsecase {
    constructor(private readonly authRepository: AuthRepository) {}

    async execute(userId: string, newPassword: string) {
        // Validate and reset the user's password
        const user = await this.authRepository.updateUser(userId, {
            password: newPassword,
        });
    }
}

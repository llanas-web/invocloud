import type { UserRepository } from "~~/shared/domain/user/user.repository";
import { UpdateUserDetailsSchema } from "../commant";

export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(raw: unknown): Promise<void> {
        const parsed = UpdateUserDetailsSchema.parse(raw);
        const user = await this.userRepository.getById(parsed.id);
        if (!user) {
            throw new Error("User not found");
        }
        const updatedUser = user.withDetails({
            fullName: parsed.fullName ?? undefined,
        });
        return await this.userRepository.update(updatedUser);
    }
}

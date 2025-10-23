import { z } from "zod";
import type { UserModel } from "~~/shared/domain/user/user.model";
import type { UserRepository } from "~~/shared/domain/user/user.repository";

export class GetUserDetailsUsecase {
    constructor(private userRepository: UserRepository) {}

    async execute(raw: unknown): Promise<UserModel | null> {
        const parsedId = z.uuid().parse(raw);
        return this.userRepository.getById(parsedId);
    }
}

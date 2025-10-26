import { z } from "zod";
import type { UserModel } from "~~/shared/domain/user/user.model";
import type { UserQuery } from "../user.query";
import type { UserDetailsDTO } from "../dto";

export class GetUserDetailsUsecase {
    constructor(private userQuery: UserQuery) {}

    async execute(raw: unknown): Promise<UserDetailsDTO | null> {
        const parsedId = z.uuid().parse(raw);
        return this.userQuery.getUserDetails(parsedId);
    }
}

import type { UserQuery } from "../user.query";
import type { UserListItemDTO } from "../dto";
import z from "zod";

export class ListUsersUsecase {
    constructor(
        private userQuery: UserQuery,
    ) {}

    async listUserByEstablishment(raw: unknown): Promise<UserListItemDTO[]> {
        const parsed = z.uuid().parse(raw);
        return this.userQuery.listUsers({ establishmentId: parsed });
    }
}

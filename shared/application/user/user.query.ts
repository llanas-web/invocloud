import type { UserListItemDTO } from "./dto";
import type { ListUserQueryFilter } from "./queries";

export interface UserQuery {
    listUsers(filters?: ListUserQueryFilter): Promise<UserListItemDTO[]>;
}

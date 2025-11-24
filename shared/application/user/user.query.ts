import type { UserDetailsDTO, UserListItemDTO } from "./dto";
import type { ListUserQueryFilter } from "./queries";

export interface UserQuery {
    listUsers(filters?: ListUserQueryFilter): Promise<UserListItemDTO[]>;
    getUserDetails(id: string): Promise<UserDetailsDTO | null>;
    getUserIdByProviderSubscriptionId(
        providerSubscriptionId: string,
    ): Promise<string | null>;
}

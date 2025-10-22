import type { EstablishmentListItemDTO } from "./dto";
import type { ListEstablishmentQueryFilter } from "./queries";

export interface EstablishmentQuery {
    listEstablishments(
        filter?: ListEstablishmentQueryFilter,
    ): Promise<EstablishmentListItemDTO[]>;

    isEmailPrefixAvailable(
        emailPrefix: string,
        excludeId?: string | null,
    ): Promise<boolean>;
}

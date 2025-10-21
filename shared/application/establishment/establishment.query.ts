import type { EstablishmentDetailsDTO, EstablishmentListItemDTO } from "./dto";
import type { ListEstablishmentQueryFilter } from "./queries";

export interface EstablishmentQuery {
    listEstablishments(
        filter?: ListEstablishmentQueryFilter,
    ): Promise<EstablishmentListItemDTO[]>;

    getEstablishmentDetails(
        id: string,
    ): Promise<EstablishmentDetailsDTO | null>;

    isEmailPrefixAvailable(
        emailPrefix: string,
        excludeId?: string | null,
    ): Promise<boolean>;
}

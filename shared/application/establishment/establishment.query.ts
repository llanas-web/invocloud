import type { EstablishmentDetailsDTO, EstablishmentListItemDTO } from "./dto";
import type { ListEstablishmentQueryFilter } from "./queries";

export interface EstablishmentQuery {
    listEstablishments(
        filter?: ListEstablishmentQueryFilter,
    ): Promise<EstablishmentListItemDTO[]>;

    isEmailPrefixAvailable(
        emailPrefix: string,
        excludeId?: string | null,
    ): Promise<boolean>;

    hasAnyByCreatorId(userId: string): Promise<boolean>;

    getEstablishmentDetails(
        id: string,
    ): Promise<EstablishmentDetailsDTO | null>;

    isSenderAuthorized(
        senderEmail: string,
        recipientEmail: string,
    ): Promise<boolean>;

    listEstablishmentBySupplierEmail(
        supplierEmail: string,
    ): Promise<EstablishmentListItemDTO[]>;
}

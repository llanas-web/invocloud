import type { RepositoryFactory } from "~~/shared/domain/common/repository.factory";
import type { QueryFactory } from "~~/shared/infra/common/query.factory";
import * as invoiceUC from "../invoice/usecases";
import * as establishmentUC from "../establishment/usecases";

export function makeUseCases(
    repositoryFactory: RepositoryFactory,
    queryFactory: QueryFactory,
) {
    const invoicesRepo = repositoryFactory.invoices();
    const invoiceListQuery = queryFactory.invoiceListQuery();
    const establishmentsRepo = repositoryFactory.establishments();
    const establishmentQuery = queryFactory.establishmentQuery();

    return {
        invoices: {
            create: new invoiceUC.CreateInvoiceUsecase(invoicesRepo),
            list: new invoiceUC.ListInvoicesUsecase(invoiceListQuery),
            updateDetails: new invoiceUC.UpdateInvoiceDetailsUsecase(
                invoicesRepo,
            ),
            updateStatus: new invoiceUC.ChangeInvoiceStatusUsecase(
                invoicesRepo,
            ),
            delete: new invoiceUC.DeleteInvoicesUsecase(invoicesRepo),
        },
        establishments: {
            create: new establishmentUC.CreateEstablishmentUsecase(
                establishmentsRepo,
            ),
            list: new establishmentUC.ListEstablishmentsUsecase(
                establishmentQuery,
            ),
            update: new establishmentUC.UpdateEstablishmentUsecase(
                establishmentsRepo,
            ),
            delete: new establishmentUC.DeleteEstablishmentUsecase(
                establishmentsRepo,
            ),
            details: new establishmentUC.GetEstablishmentDetailsUsecase(
                establishmentQuery,
            ),
            inviteMember: new establishmentUC.InviteMemberUseCase(
                establishmentsRepo,
                // establishmentQuery,
                // emailPrefixAvailable,
            ),
            emailPrefixAvailable: new establishmentUC
                .EmailPrefixAvailableUsecase(
                establishmentQuery,
            ),
        },
    } as const;
}

import type { RepositoryFactory } from "~~/shared/domain/common/repository.factory";
import type { QueryFactory } from "~~/shared/infra/common/query.factory";
import * as invoiceUC from "../invoice/usecases";
import * as establishmentUC from "../establishment/usecases";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";

export function makeUseCases(
    repositoryFactory: RepositoryFactory,
    queryFactory: QueryFactory,
    paymentFactory: PaymentRepository,
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
            details: new invoiceUC.GetInvoiceDetailsUsecase(invoicesRepo),
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
                establishmentsRepo,
            ),
            emailPrefixAvailable: new establishmentUC
                .EmailPrefixAvailableUsecase(
                establishmentQuery,
            ),
            member: {
                invite: new establishmentUC.InviteMemberUsecase(
                    establishmentsRepo,
                    // establishmentQuery,
                    // emailPrefixAvailable,
                ),
            },
            subscription: {
                createCheckoutSession: new establishmentUC
                    .CreateCheckoutSessionUsecase(
                    establishmentsRepo,
                    paymentFactory,
                ),
                createSubscription: new establishmentUC
                    .CreateSubscriptionUsecase(
                    establishmentsRepo,
                    paymentFactory,
                ),
                cancelSubscription: new establishmentUC
                    .CancelSubscriptionUsecase(
                    establishmentsRepo,
                    paymentFactory,
                ),
            },
        },
    } as const;
}

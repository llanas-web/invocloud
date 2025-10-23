import type { RepositoryFactory } from "~~/shared/domain/common/repository.factory";
import type { QueryFactory } from "~~/shared/infra/common/query.factory";
import * as invoiceUC from "../invoice/usecases";
import * as establishmentUC from "../establishment/usecases";
import * as supplierUC from "../supplier/usecases";
import * as userUc from "../user/usecases";

export function makeUseCasesClient(
    repositoryFactory: RepositoryFactory,
    queryFactory: QueryFactory,
) {
    const invoicesRepo = repositoryFactory.invoices();
    const invoiceListQuery = queryFactory.invoiceListQuery();
    const establishmentsRepo = repositoryFactory.establishments();
    const establishmentQuery = queryFactory.establishmentQuery();
    const suppliersRepo = repositoryFactory.suppliers();
    const suppliersQuery = queryFactory.suppliersQuery();
    const userRepo = repositoryFactory.users();

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
        },
        suppliers: {
            create: new supplierUC.CreateSupplierUsecase(
                suppliersRepo,
            ),
            list: new supplierUC.ListSuppliersUsecase(
                suppliersQuery,
            ),
            details: new supplierUC.GetSupplierDetailsUsecase(
                suppliersRepo,
            ),
            update: new supplierUC.UpdateSupplierUsecase(
                suppliersRepo,
            ),
        },
        users: {
            details: new userUc.GetUserDetailsUsecase(
                userRepo,
            ),
            update: new userUc.UpdateUserUseCase(
                userRepo,
            ),
            delete: new userUc.DeleteUserUsecase(
                userRepo,
                establishmentQuery,
            ),
        },
    } as const;
}

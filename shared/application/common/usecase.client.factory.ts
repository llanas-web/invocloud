import type { RepositoriesFactory } from "~~/shared/domain/common/repositories.factory";
import type { QueriesFactory } from "~~/shared/domain/common/queries.factory";
import * as invoiceUC from "../invoice/usecases";
import * as establishmentUC from "../establishment/usecases";
import * as supplierUC from "../supplier/usecases";
import * as userUc from "../user/usecases";
import type { StorageRepository } from "./providers/storage/storage.repository";

export function makeUseCasesClient(
    repositoryFactory: RepositoriesFactory,
    queryFactory: QueriesFactory,
    // authRepository: AuthRepository,
    storageRepository: StorageRepository,
) {
    const invoicesRepo = repositoryFactory.invoices();
    const invoiceQuery = queryFactory.invoiceQuery();
    const establishmentsRepo = repositoryFactory.establishments();
    const establishmentQuery = queryFactory.establishmentQuery();
    const suppliersRepo = repositoryFactory.suppliers();
    const suppliersQuery = queryFactory.suppliersQuery();
    const userRepo = repositoryFactory.users();
    const userQuery = queryFactory.userQuery();

    return {
        invoices: {
            create: new invoiceUC.CreateInvoiceUsecase(
                invoicesRepo,
                storageRepository,
            ),
            list: new invoiceUC.ListInvoicesUsecase(invoiceQuery),
            updateDetails: new invoiceUC.UpdateInvoiceDetailsUsecase(
                invoicesRepo,
            ),
            details: new invoiceUC.GetInvoiceDetailsUsecase(invoiceQuery),
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
            delete: new supplierUC.DeleteSupplierUseCase(
                suppliersRepo,
            ),
        },
        users: {
            list: new userUc.ListUsersUsecase(
                userQuery,
            ),
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

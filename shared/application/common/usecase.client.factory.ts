import type { RepositoriesFactory } from "~~/shared/domain/common/repositories.factory";
import type { QueriesFactory } from "~~/shared/domain/common/queries.factory";
import type { StorageRepository } from "./providers/storage/storage.repository";
import CreateInvoiceUsecase from "../invoice/usecases/create-invoice.usecase";
import UpdateInvoiceDetailsUsecase from "../invoice/usecases/update-invoice-details.usecase";
import ChangeInvoiceStatusUsecase from "../invoice/usecases/change-invoice-status.usecase";
import DeleteInvoicesUsecase from "../invoice/usecases/delete-invoices.usecase";
import CreateEstablishmentUsecase from "../establishment/usecases/create-establishment.usecase";
import UpdateEstablishmentUsecase from "../establishment/usecases/update-establishment.usecase";
import DeleteEstablishmentUsecase from "../establishment/usecases/delete-establishments.usecase";
import CreateSupplierUsecase from "../supplier/usecases/create-supplier.usecase";
import UpdateSupplierUsecase from "../supplier/usecases/update-supplier.usecase";
import DeleteSupplierUseCase from "../supplier/usecases/delete-supplier.usecase";
import UpdateUserUseCase from "../user/usecases/update-user.usecase";
import DeleteUserUsecase from "../user/usecases/delete-user.usecase";
import ToggleFavoriteUsecase from "../user/usecases/toggle-favorite.usecase";

export function makeUseCasesClient(
    repositoryFactory: RepositoriesFactory,
    queryFactory: QueriesFactory,
    storageRepository: StorageRepository,
) {
    const q = queryFactory.queries;
    const r = repositoryFactory.repositories;

    return {
        invoices: {
            create: new CreateInvoiceUsecase(r, q, storageRepository),
            updateDetails: new UpdateInvoiceDetailsUsecase(r, q),
            updateStatus: new ChangeInvoiceStatusUsecase(r, q),
            delete: new DeleteInvoicesUsecase(r, q),
        },
        establishments: {
            create: new CreateEstablishmentUsecase(r, q),
            update: new UpdateEstablishmentUsecase(r, q),
            delete: new DeleteEstablishmentUsecase(r, q),
        },
        suppliers: {
            create: new CreateSupplierUsecase(r, q),
            update: new UpdateSupplierUsecase(r, q),
            delete: new DeleteSupplierUseCase(r, q),
        },
        users: {
            update: new UpdateUserUseCase(r, q),
            delete: new DeleteUserUsecase(r, q),
            toggleFavorite: new ToggleFavoriteUsecase(r, q),
        },
    } as const;
}

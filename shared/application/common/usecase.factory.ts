import type { RepositoryFactory } from "~~/shared/domain/common/repository.factory";
import { CreateInvoiceUsecase } from "../invoice/usecases/create-invoice.usecase";
import { ListInvoicesUsecase } from "../invoice/usecases/list-invoices.usecase";
import type { QueryFactory } from "~~/shared/infra/common/query.factory";
import { UpdateInvoiceDetailsUsecase } from "../invoice/usecases/update-invoice-details.usecase";
import { ChangeInvoiceStatusUsecase } from "../invoice/usecases/change-invoice-status.usecase";

export function makeUseCases(
    repositoryFactory: RepositoryFactory,
    queryFactory: QueryFactory,
) {
    const invoicesRepo = repositoryFactory.invoices();
    const invoiceListQuery = queryFactory.invoiceListQuery();

    return {
        invoices: {
            create: new CreateInvoiceUsecase(invoicesRepo),
            list: new ListInvoicesUsecase(invoiceListQuery),
            updateDetails: new UpdateInvoiceDetailsUsecase(invoicesRepo),
            updateStatus: new ChangeInvoiceStatusUsecase(invoicesRepo),
            delete: new ChangeInvoiceStatusUsecase(invoicesRepo),
        },
    } as const;
}

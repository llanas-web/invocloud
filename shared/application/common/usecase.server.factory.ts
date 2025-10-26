import type { RepositoriesFactory } from "~~/shared/domain/common/repositories.factory";
import type { QueriesFactory } from "~~/shared/domain/common/queries.factory";
import * as invoiceUC from "../invoice/usecases";
import * as establishmentUC from "../establishment/usecases";
import * as supplierUC from "../supplier/usecases";
import * as userUc from "../user/usecases";
import * as guestUploadSessionUC from "../guest-upload/usecases";
import * as invoiceTaskUC from "../invoice-task/usecase";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import ServerError from "~~/server/core/errors";
import { HTTPStatus } from "~~/server/core/errors/status";
import type { StorageRepository } from "./providers/storage/storage.repository";
import type { EmailRepository } from "./providers/email/email.repository";
import type { AuthRepository } from "./providers/auth/auth.repository";
import type { OcrRepository } from "./providers/ocr/ocr.repository";

export function makeUseCasesServer(
    repositoryFactory: RepositoriesFactory,
    queryFactory: QueriesFactory,
    paymentRepository: PaymentRepository,
    storageRepository: StorageRepository,
    emailRepository: EmailRepository,
    authRepository: AuthRepository,
    ocrRepository: OcrRepository,
) {
    if (import.meta.client || !import.meta.server) {
        throw new ServerError(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            "Server UseCasesFactory can only be instantiated on the server side.",
        );
    }
    const invoicesRepo = repositoryFactory.invoices();
    const invoiceQuery = queryFactory.invoiceQuery();
    const establishmentsRepo = repositoryFactory.establishments();
    const establishmentQuery = queryFactory.establishmentQuery();
    const suppliersRepo = repositoryFactory.suppliers();
    const suppliersQuery = queryFactory.suppliersQuery();
    const userRepo = repositoryFactory.users();
    const userQuery = queryFactory.userQuery();
    const guestUploadSessionRepo = repositoryFactory.guestUploadSessions();
    const invoiceTasksRepo = repositoryFactory.invoiceTasks();

    return {
        invoices: {
            list: new invoiceUC.ListInvoicesUsecase(invoiceQuery),
            updateDetails: new invoiceUC.UpdateInvoiceDetailsUsecase(
                invoicesRepo,
            ),
            details: new invoiceUC.GetInvoiceDetailsUsecase(invoiceQuery),
            updateStatus: new invoiceUC.ChangeInvoiceStatusUsecase(
                invoicesRepo,
            ),
            delete: new invoiceUC.DeleteInvoicesUsecase(invoicesRepo),
            sendByEmail: new invoiceUC.SendInvoiceByEmailUsecase(
                invoiceQuery,
                emailRepository,
                storageRepository,
            ),
            upload: {
                createInvoiceFromUpload: new invoiceUC
                    .CreateInvoiceFromUploadUsecase(
                    invoicesRepo,
                    establishmentsRepo,
                    storageRepository,
                ),
                checkUploadAuthorization: new invoiceUC
                    .CheckUploadAuthorizationUsecase(
                    establishmentQuery,
                ),
            },
            mail: {
                handleInbound: new invoiceUC.HandleInboundMailUsecase(
                    establishmentQuery,
                    suppliersQuery,
                    invoicesRepo,
                    storageRepository,
                ),
            },
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
            member: {
                invite: new establishmentUC.InviteMemberUsecase(
                    establishmentsRepo,
                    userQuery,
                    emailRepository,
                    authRepository,
                ),
            },
            subscription: {
                createCheckoutSession: new establishmentUC
                    .CreateCheckoutSessionUsecase(
                    establishmentsRepo,
                    authRepository,
                    paymentRepository,
                ),
                createSubscription: new establishmentUC
                    .CreateSubscriptionUsecase(
                    establishmentsRepo,
                    userRepo,
                    emailRepository,
                ),
                cancelSubscription: new establishmentUC
                    .CancelSubscriptionUsecase(
                    establishmentsRepo,
                    paymentRepository,
                ),
                updateSubscription: new establishmentUC
                    .ActivateSubscriptionUsecase(
                    establishmentsRepo,
                ),
                handlePaymentEvents: new establishmentUC
                    .HandlePaymentEventsUsecase(
                    establishmentsRepo,
                ),
            },
        },
        suppliers: {
            create: new supplierUC.CreateSupplierUsecase(
                suppliersRepo,
            ),
            list: new supplierUC.ListSuppliersUsecase(suppliersQuery),
            details: new supplierUC.GetSupplierDetailsUsecase(
                suppliersRepo,
            ),
            update: new supplierUC.UpdateSupplierUsecase(suppliersRepo),
            delete: new supplierUC.DeleteSupplierUseCase(
                suppliersRepo,
            ),
        },
        users: {
            details: new userUc.GetUserDetailsUsecase(
                userQuery,
            ),
            update: new userUc.UpdateUserUseCase(
                userRepo,
            ),
            delete: new userUc.DeleteUserUsecase(
                userRepo,
                establishmentQuery,
            ),
            list: new userUc.ListUsersUsecase(
                userQuery,
            ),
            toggleFavorite: new userUc.ToggleFavoriteUsecase(
                userRepo,
            ),
        },
        guestUploadSession: {
            initiate: new guestUploadSessionUC.InitiateGuestUploadUseCase(
                establishmentQuery,
                guestUploadSessionRepo,
                emailRepository,
                hashCode,
            ),
            verify: new guestUploadSessionUC.VerifyGuestUploadSessionUseCase(
                guestUploadSessionRepo,
                establishmentQuery,
                hashCode,
            ),
            createInvoice: new guestUploadSessionUC
                .CreateInvoiceFromGuestSessionUseCase(
                guestUploadSessionRepo,
                invoicesRepo,
                suppliersQuery,
            ),
        },
        invoiceTask: {
            createOcrTask: new invoiceTaskUC.CreateOcrTaskUsecase(
                invoiceTasksRepo,
                invoicesRepo,
            ),
            processOcrWebhook: new invoiceTaskUC.ProcessOcrWebhookUsecase(
                invoiceTasksRepo,
                invoicesRepo,
            ),
            processPendingTasks: new invoiceTaskUC.ProcessPendingTasksUsecase(
                invoiceTasksRepo,
                invoicesRepo,
                storageRepository,
                ocrRepository,
            ),
        },
    } as const;
}

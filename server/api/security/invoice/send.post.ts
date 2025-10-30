import { useServerDi } from "~~/server/middleware/injection.middleware";
import { SendInvoicesBodySchema } from "#shared/contracts/api/security/invoices/send.contract";
import SendInvoicesUsecase from "~~/shared/application/invoice/usecases/send-by-email.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, emailRepository, storageRepository } =
            useServerDi(
                event,
            );
        const { invoices, email } = await parseBody(
            event,
            SendInvoicesBodySchema,
        );

        const sendByEmailUsecase = new SendInvoicesUsecase(
            repos,
            queries,
            emailRepository,
            storageRepository,
        );

        await sendByEmailUsecase.execute({
            invoiceIds: invoices,
            recipientEmail: email,
        });
    } catch (error) {
        return handleError(error);
    }
});

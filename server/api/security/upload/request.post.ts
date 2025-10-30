import { useServerDi } from "~~/server/middleware/injection.middleware";
import { RequestInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/request.contract";
import CheckUploadAuthorizationUsecase from "~~/shared/application/invoice/usecases/upload/check-upload-authorization.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries } = useServerDi(event);

        const { senderEmail, recipientEmail } = await parseBody(
            event,
            RequestInvoiceUploadSchema,
        );

        const checkUploadAuthorizationUsecase =
            new CheckUploadAuthorizationUsecase(
                repos,
                queries,
            );

        const establishments = await checkUploadAuthorizationUsecase.execute({
            senderEmail,
            recipientEmail,
        });

        return { establishments };
    } catch (error) {
        return handleError(error);
    }
});

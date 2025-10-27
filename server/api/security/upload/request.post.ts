import { useServerDi } from "~~/server/middleware/injection.middleware";
import { RequestInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/request.contract";
import CheckUploadAuthorizationUsecase from "~~/shared/application/invoice/usecases/upload/check-upload-authorization.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries } = useServerDi(event);

    const { senderEmail, recipientEmail } = await parseBody(
        event,
        RequestInvoiceUploadSchema,
    );

    const checkUploadAuthorizationUsecase = new CheckUploadAuthorizationUsecase(
        repos,
        queries,
    );

    const establishments = await checkUploadAuthorizationUsecase.execute({
        senderEmail,
        recipientEmail,
    });

    return { establishments };
});

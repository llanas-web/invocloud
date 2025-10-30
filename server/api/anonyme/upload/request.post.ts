import { useServerDi } from "~~/server/middleware/injection.middleware";
import { RequestUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/request.contract";
import InitiateGuestUploadUseCase from "~~/shared/application/guest-upload/usecases/initiate-guest-upload.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(
    async (event) => {
        try {
            const { repos, queries, emailRepository } = useServerDi(event);
            const { senderEmail, recipientEmail } = await parseBody(
                event,
                RequestUploadInvoiceRequestSchema,
            );

            const guestUploadSessionUsecases = new InitiateGuestUploadUseCase(
                repos,
                queries,
                emailRepository,
                hashCode,
            );

            await guestUploadSessionUsecases.execute({
                senderEmail,
                recipientEmail,
            });
        } catch (error) {
            return handleError(error);
        }
    },
);

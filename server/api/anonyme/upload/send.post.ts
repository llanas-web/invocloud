import { useServerDi } from "~~/server/middleware/injection.middleware";
import { SendUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/send.contract";
import CreateInvoiceFromGuestSessionUseCase from "~~/shared/application/guest-upload/usecases/create-invoice-from-guest-session.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries } = useServerDi(event);
        const { sessionId, establishmentId, comment, fileName } =
            await parseBody(
                event,
                SendUploadInvoiceRequestSchema,
            );

        const guestUploadSessionCreateUsecase =
            new CreateInvoiceFromGuestSessionUseCase(
                repos,
                queries,
            );

        return guestUploadSessionCreateUsecase.execute({
            sessionId,
            establishmentId,
            comment,
            fileName,
        });
    } catch (error) {
        return handleError(error);
    }
});

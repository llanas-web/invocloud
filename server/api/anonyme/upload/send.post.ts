import { useServerDi } from "~~/server/middleware/injection.middleware";
import { SendUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/send.contract";
import CreateInvoiceFromGuestSessionUseCase from "~~/shared/application/guest-upload/usecases/create-invoice-from-guest-session.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries } = useServerDi(event);
    const { sessionId, establishmentId, comment, fileName } = await parseBody(
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
});

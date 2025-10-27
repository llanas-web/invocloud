import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { SendUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/send.contract";

export default defineEventHandler(async (event) => {
    const { guestUploadSession } = useServerUsecases(event);

    const { sessionId, establishmentId, comment, fileName } = await parseBody(
        event,
        SendUploadInvoiceRequestSchema,
    );

    return guestUploadSession.createInvoice.execute({
        sessionId,
        establishmentId,
        comment,
        fileName,
    });
});

import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { SendUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/send.contract";

export default defineEventHandler(async (event) => {
    const { guestUploadSession } = useServerUsecases(event);

    const { uploadValidationId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            SendUploadInvoiceRequestSchema,
        );

    return guestUploadSession.createInvoice.execute({
        uploadValidationId,
        selectedEstablishmentId,
        comment,
        fileName,
    });
});

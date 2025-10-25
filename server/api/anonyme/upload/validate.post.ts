import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { ValidateUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/validate.contract";

export default defineEventHandler(async (event) => {
    const { guestUploadSession } = useServerUsecases(event);

    const { uploadValidationId, token } = await parseBody(
        event,
        ValidateUploadInvoiceRequestSchema,
    );

    return guestUploadSession.verify.execute({
        uploadValidationId,
        token,
    });
});

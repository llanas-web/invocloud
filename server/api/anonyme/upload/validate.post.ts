import { ValidateUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/validate.contract";
import VerifyGuestUploadSessionUseCase from "~~/shared/application/guest-upload/usecases/verify-guest-upload-session.usecase";
import { useServerDi } from "~~/server/middleware/injection.middleware";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries } = useServerDi(event);
        const { uploadValidationId, token } = await parseBody(
            event,
            ValidateUploadInvoiceRequestSchema,
        );

        const verifyUsecase = new VerifyGuestUploadSessionUseCase(
            repos,
            queries,
            hashCode,
        );

        return verifyUsecase.execute({
            sessionId: uploadValidationId,
            verificationCode: token,
        });
    } catch (error) {
        return handleError(error);
    }
});

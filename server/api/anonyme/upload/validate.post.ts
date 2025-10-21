import z from "zod";
import { hashCode } from "~/utils/hash";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { ValidateUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/validate.contract";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            auth,
            database: {
                uploadValidationRepository,
            },
        },
    } = await buildRequestScope(event);

    const { uploadValidationId, token } = await parseBody(
        event,
        ValidateUploadInvoiceRequestSchema,
    );

    if (!auth.currentUser) {
        throw createError({
            status: HTTPStatus.FORBIDDEN,
            message: "MustBeConnected",
        });
    }

    const hashedCode = hashCode(token);
    const uploadValidation = await uploadValidationRepository
        .getUploadValidation(
            uploadValidationId,
            auth.currentUser.id,
            hashedCode,
        );

    if (!uploadValidation) {
        throw createError({
            status: 404,
            message: "Fichier introuvable ou token expiré",
        });
    }

    return {
        establishments: uploadValidation.establishments,
    };
});

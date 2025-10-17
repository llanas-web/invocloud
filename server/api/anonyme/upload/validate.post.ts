import z from "zod";
import { hashCode } from "~/utils/hash";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";

const schema = z.object({
    uploadValidationId: z.string().uuid(),
    token: z.string().min(6).max(6),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            auth,
            repos: {
                uploadValidationRepository,
            },
        },
    } = await buildRequestScope(event);

    const { uploadValidationId, token } = await parseBody(
        event,
        schema,
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

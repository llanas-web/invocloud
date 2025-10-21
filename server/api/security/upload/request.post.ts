import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { RequestUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/request.contract";

export default defineEventHandler(async (event) => {
    const { deps: { database: { establishmentRepository } } } =
        await buildRequestScope(event);
    const { senderEmail, recipientEmail } = await parseBody(
        event,
        RequestUploadInvoiceRequestSchema,
    );

    const establishments = await establishmentRepository
        .getEstablishmentsShortFromEmails(
            senderEmail,
            recipientEmail,
        );
    if (establishments.length === 0) {
        throw createError({
            status: HTTPStatus.FORBIDDEN,
            message: "Aucune autorisation d'envoi pour ce destinataire",
        });
    }
    return establishments;
});

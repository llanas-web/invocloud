import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";

const schema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

export default defineEventHandler(async (event) => {
    const { deps: { database: { establishmentRepository } } } =
        await buildRequestScope(event);
    const { senderEmail, recipientEmail } = await parseBody(
        event,
        schema,
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

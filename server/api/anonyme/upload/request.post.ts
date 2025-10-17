import z from "zod";
import { generateCode } from "~/utils/hash";
import { buildRequestScope } from "~~/server/core/container";

const schema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            repos: {
                establishmentRepository,
                uploadValidationRepository,
            },
            auth,
            email,
        },
    } = await buildRequestScope(event);

    const { senderEmail, recipientEmail } = await parseBody(
        event,
        schema,
    );

    const establishements = await establishmentRepository
        .getEstablishmentsShortFromEmails(
            senderEmail,
            recipientEmail,
        );
    if (establishements.length === 0) {
        throw createError({
            status: 401,
            message: "Aucune autorisation d'envoi pour ce destinataire",
        });
    }

    const anonymousUser = await auth.anonymousSignIn(senderEmail);

    const code = generateCode();
    const newUploadRequestId = await uploadValidationRepository
        .createUploadValidation(
            senderEmail,
            recipientEmail,
            code,
            anonymousUser.id,
            establishements.map((establishement) => establishement.id),
        );

    await email.sendEmail({
        to: [senderEmail],
        subject: "Confirmez votre envoie de facture",
        html: `Bonjour,<br><br>` +
            `Pour valider l'envoie de votre facture, veuillez saisir le code suivant dans l'application : <strong>${code}</strong>.<br><br>` +
            `Si vous n'avez pas demandé cet envoi, veuillez ignorer ce message.<br><br>` +
            `<p>L'équipe InvoCloud</p>`,
    });
    return newUploadRequestId;
});

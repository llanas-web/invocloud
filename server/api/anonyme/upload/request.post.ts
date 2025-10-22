import { generateCode, hashCode } from "~/utils/hash";
import { buildRequestScope } from "~~/server/core/container";
import { RequestUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/anonyme/upload/request.contract";

export default defineEventHandler(
    async (event) => {
        const {
            deps: {
                database: {
                    establishmentRepository,
                    uploadValidationRepository,
                },
                auth,
                email,
            },
        } = await buildRequestScope(event);

        const { senderEmail, recipientEmail } = await parseBody(
            event,
            RequestUploadInvoiceRequestSchema,
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
                hashCode(code),
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
    },
);

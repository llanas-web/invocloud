import { z } from "zod";
import type { EmailRepository } from "../../common/providers/email/email.repository";
import { ApplicationError } from "../../common/errors/application.error";
import GuestUploadSessionModel from "~~/shared/domain/guest-upload/guest-upload-session.model";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const InitiateGuestUploadSchema = z.object({
    senderEmail: z.email("Email invalide"),
    recipientEmail: z.email("Email invalide"),
});
export type InitiateGuestUploadCommand = z.input<
    typeof InitiateGuestUploadSchema
>;

export default class InitiateGuestUploadUseCase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly emailRepository: EmailRepository,
        private readonly hashToken: (token: string) => string,
    ) {}

    async execute(command: InitiateGuestUploadCommand) {
        const parsed = InitiateGuestUploadSchema.parse(command);

        const isAuthorized = await this.queries.establishmentQuery
            .isSenderAuthorized(
                parsed.senderEmail,
                parsed.recipientEmail,
            );

        if (!isAuthorized) {
            throw new ApplicationError(
                "Vous n'êtes pas autorisé à envoyer des factures à cet établissement",
            );
        }

        // 2. Générer un code à 6 chiffres
        const verificationCode = Math.floor(100000 + Math.random() * 900000)
            .toString();
        const tokenHash = this.hashToken(verificationCode);

        // 3. Créer la session
        const session = GuestUploadSessionModel.create(
            parsed.senderEmail,
            tokenHash,
        );

        // 4. Sauvegarder
        await this.repos.guestUploadSessionsRepo.save(session);

        // 5. Envoyer l'email
        try {
            await this.emailRepository.sendEmail({
                to: [parsed.senderEmail],
                subject: "Confirmez votre envoie de facture",
                html: `Bonjour,<br><br>` +
                    `Pour valider l'envoie de votre facture, veuillez saisir le code suivant dans l'application : <strong>${verificationCode}</strong>.<br><br>` +
                    `Si vous n'avez pas demandé cet envoi, veuillez ignorer ce message.<br><br>` +
                    `<p>L'équipe InvoCloud</p>`,
            });
        } catch (error) {
            // En cas d'échec d'envoi d'email, on supprime la session
            await this.repos.guestUploadSessionsRepo.delete(session.id);
            throw new ApplicationError(
                "Erreur lors de l'envoi de l'email de vérification",
            );
        }

        return {
            sessionId: session.id,
            expiresAt: session.toPersistence().expiresAt,
        };
    }
}

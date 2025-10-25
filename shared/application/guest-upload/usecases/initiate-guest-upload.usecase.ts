import { z } from "zod";
import type { EstablishmentQuery } from "../../establishment/establishment.query";
import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import type { EmailRepository } from "../../common/providers/email/email.repository";
import type { GuestUploadResult } from "~~/shared/domain/guest-upload/guest-upload-session.model";
import { InitiateGuestUploadSchema } from "../command";
import { ApplicationError } from "../../common/errors/application.error";
import GuestUploadSessionModel from "~~/shared/domain/guest-upload/guest-upload-session.model";

export interface InitiateGuestUploadOutput {
    sessionId: string;
    expiresAt: Date;
}

export class InitiateGuestUploadUseCase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
        private readonly sessionRepository: GuestUploadSessionRepository,
        private readonly emailRepository: EmailRepository,
        private readonly hashToken: (token: string) => string,
    ) {}

    async execute(raw: unknown) {
        const parsed = InitiateGuestUploadSchema.parse(raw);

        const isAuthorized = await this.establishmentQuery.isSenderAuthorized(
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
        await this.sessionRepository.save(session);

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
            await this.sessionRepository.delete(session.id);
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

import { z } from "zod";
import { VerifyGuestUploadSessionSchema } from "../command";
import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import { ApplicationError } from "../../common/errors/application.error";
import type { EstablishmentQuery } from "../../establishment/establishment.query";

export class VerifyGuestUploadSessionUseCase {
    constructor(
        private readonly sessionRepository: GuestUploadSessionRepository,
        private readonly establishmentQuery: EstablishmentQuery,
        private readonly hashToken: (token: string) => string,
    ) {}

    async execute(raw: unknown) {
        const parsed = VerifyGuestUploadSessionSchema.parse(raw);

        const { sessionId, verificationCode } = parsed;

        // 1. Récupérer la session
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new ApplicationError("Session introuvable");
        }

        // 2. Vérifier le code
        const verifyResult = session.verify(verificationCode, this.hashToken);
        if (!verifyResult.success) {
            throw new ApplicationError(
                "Code de vérification invalide",
                verifyResult.error,
            );
        }

        // 3. Sauvegarder la session vérifiée
        await this.sessionRepository.save(session);

        // 4. Récupérer les établissements disponibles
        const establishments = await this.establishmentQuery
            .listEstablishmentBySupplierEmail(session.senderEmail);

        return {
            availableEstablishments: establishments.map((est) => ({
                id: est.id,
                name: est.name,
            })),
        };
    }
}

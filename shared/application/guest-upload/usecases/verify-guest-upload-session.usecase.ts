import { z } from "zod";
import { ApplicationError } from "../../common/errors/application.error";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const VerifyGuestUploadSessionSchema = z.object({
    sessionId: z.uuid("ID de session invalide"),
    verificationCode: z.string().length(6, "Le code doit contenir 6 chiffres"),
});
export type VerifyGuestUploadSessionCommand = z.input<
    typeof VerifyGuestUploadSessionSchema
>;

export default class VerifyGuestUploadSessionUseCase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly hashToken: (token: string) => string,
    ) {}

    async execute(command: VerifyGuestUploadSessionCommand) {
        const parsed = VerifyGuestUploadSessionSchema.parse(command);

        const { sessionId, verificationCode } = parsed;

        // 1. Récupérer la session
        const session = await this.repos.guestUploadSessionsRepo.findById(
            sessionId,
        );
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
        await this.repos.guestUploadSessionsRepo.save(verifyResult.value!);

        // 4. Récupérer les établissements disponibles
        const establishments = await this.queries.establishmentQuery
            .listEstablishmentBySupplierEmail(session.senderEmail);

        return {
            availableEstablishments: establishments.map((est) => ({
                id: est.id,
                name: est.name,
            })),
        };
    }
}

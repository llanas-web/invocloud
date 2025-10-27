import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const CheckUploadAuthorizationSchema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
});
export type CheckUploadAuthorizationCommand = z.input<
    typeof CheckUploadAuthorizationSchema
>;

export default class CheckUploadAuthorizationUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(command: CheckUploadAuthorizationCommand) {
        const parsed = CheckUploadAuthorizationSchema.parse(command);

        // 1. Vérifier que le sender est autorisé
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

        // 2. Récupérer les établissements disponibles pour ce sender
        const establishments = await this.queries.establishmentQuery
            .listEstablishmentBySupplierEmail(parsed.senderEmail);

        if (establishments.length === 0) {
            throw new ApplicationError(
                "Aucun établissement trouvé pour cet email",
            );
        }

        return { establishments };
    }
}

import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";
import { CheckUploadAuthorizationSchema } from "../../commands";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";

export class CheckUploadAuthorizationUsecase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
    ) {}

    async execute(raw: unknown) {
        const command = CheckUploadAuthorizationSchema.parse(raw);

        // 1. Vérifier que le sender est autorisé
        const isAuthorized = await this.establishmentQuery.isSenderAuthorized(
            command.senderEmail,
            command.recipientEmail,
        );

        if (!isAuthorized) {
            throw new ApplicationError(
                "Vous n'êtes pas autorisé à envoyer des factures à cet établissement",
            );
        }

        // 2. Récupérer les établissements disponibles pour ce sender
        const establishments = await this.establishmentQuery
            .listEstablishmentBySupplierEmail(command.senderEmail);

        if (establishments.length === 0) {
            throw new ApplicationError(
                "Aucun établissement trouvé pour cet email",
            );
        }

        return { establishments };
    }
}

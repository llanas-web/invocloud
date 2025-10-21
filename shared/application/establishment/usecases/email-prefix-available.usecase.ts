import type { EstablishmentQuery } from "../establishment.query";
import { EmailPrefixAvailableQuerySchema } from "../queries";

export class EmailPrefixAvailableUsecase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
    ) {}

    async execute(raw: unknown) {
        const input = EmailPrefixAvailableQuerySchema.parse(raw);
        return this.establishmentQuery.isEmailPrefixAvailable(
            input.emailPrefix,
            input.excludeId,
        );
    }
}

import type { EstablishmentQuery } from "../establishment.query";
import {
    type EmailPrefixAvailableInput,
    EmailPrefixAvailableQuerySchema,
} from "../queries";

export class EmailPrefixAvailableUsecase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
    ) {}

    async execute(raw: EmailPrefixAvailableInput) {
        const input = EmailPrefixAvailableQuerySchema.parse(raw);
        return this.establishmentQuery.isEmailPrefixAvailable(
            input.emailPrefix,
            input.excludeId,
        );
    }
}

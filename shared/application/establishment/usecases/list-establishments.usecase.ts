import type { EstablishmentListItemDTO } from "../dto";
import type { EstablishmentQuery } from "../establishment.query";
import { ListEstablishmentQueryFilterSchema } from "../queries";

export class ListEstablishmentsUsecase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
    ) {}

    async execute(
        filters?: unknown,
    ): Promise<EstablishmentListItemDTO[]> {
        const _filters = filters === undefined
            ? undefined
            : ListEstablishmentQueryFilterSchema.parse(filters);
        return this.establishmentQuery.listEstablishments(_filters);
    }
}

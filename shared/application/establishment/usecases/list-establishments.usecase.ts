import type {
    EstablishmentListFilter,
    EstablishmentListItemDTO,
    EstablishmentListQuery,
} from "../queries/establishment-list.query";
import { EstablishementListQuerySchema } from "../query";

export class ListEstablishmentsUsecase {
    constructor(
        private readonly establishmentListQuery: EstablishmentListQuery,
    ) {}

    async execute(
        filters?: unknown,
    ): Promise<EstablishmentListItemDTO[]> {
        const _filters = filters === undefined
            ? undefined
            : EstablishementListQuerySchema.parse(filters);
        return this.establishmentListQuery.execute(_filters);
    }
}

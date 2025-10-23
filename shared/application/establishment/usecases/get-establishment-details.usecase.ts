import { z } from "zod";
import type { EstablishmentQuery } from "../establishment.query";

export class GetEstablishmentDetailsUsecase {
    constructor(
        private readonly establishmentQuery: EstablishmentQuery,
    ) {}

    async execute(id: unknown) {
        const parsedId = z.uuid().parse(id);
        return this.establishmentQuery.getEstablishmentDetails(parsedId);
    }
}

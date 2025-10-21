import type {
    DraftEstablishment,
    EstablishmentImmutableProps,
    EstablishmentModel,
    EstablishmentMutableProps,
} from "./establishment.model";

export interface EstablishmentRepository {
    getById(id: string): Promise<EstablishmentModel | null>;
    create(entity: DraftEstablishment): Promise<EstablishmentModel>;
    update(entity: EstablishmentModel): Promise<EstablishmentModel>;
    deleteMany(establishmentIds: string[]): Promise<void>;
}

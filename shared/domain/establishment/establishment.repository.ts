import type {
    DraftEstablishment,
    EstablishmentModel,
} from "./establishment.model";

export interface EstablishmentRepository {
    getById(id: string): Promise<EstablishmentModel | null>;
    create(entity: DraftEstablishment): Promise<string>;
    update(entity: EstablishmentModel): Promise<void>;
    delete(id: string): Promise<void>;
    deleteMany(establishmentIds: string[]): Promise<void>;
}

import type { EstablishmentModel } from "~~/shared/domain/establishment/establishment.model";

export class EstablishmentViewModel {
    constructor(
        private establishment: EstablishmentModel,
    ) {}

    get name() {
        return this.establishment.name;
    }
    get address() {
        return this.establishment.address;
    }
    get phone() {
        return this.establishment.phone;
    }
    get emailPrefix() {
        return this.establishment.emailPrefix;
    }
}

import type { EstablishmentListItemDTO } from "~~/shared/application/establishment/dto";

export class EstablishmentListItemViewModel {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly emailPrefix: string,
    ) {}

    static fromDTO(
        dto: EstablishmentListItemDTO,
    ): EstablishmentListItemViewModel {
        return new EstablishmentListItemViewModel(
            dto.id,
            dto.name,
            dto.emailPrefix,
        );
    }
}

import type { SupplierListItemDTO } from "~~/shared/application/supplier/dto";

export class SupplierListItemViewModel {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly emails: string[],
    ) {}

    static fromDTO(
        dto: SupplierListItemDTO,
    ): SupplierListItemViewModel {
        return new SupplierListItemViewModel(
            dto.id,
            dto.name,
            dto.emails,
        );
    }
}

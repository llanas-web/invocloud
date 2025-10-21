export type EstablishmentListItemDTO = {
    id: string;
    name: string;
    emailPrefix: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;

    address: string | null;
    phone: string | null;
};

export type EstablishmentListFilter = {
    memberIds?: string[];
    ids?: string[];
    emailPrefixes?: string[];
};

export interface EstablishmentListQuery {
    execute(
        filter?: EstablishmentListFilter,
    ): Promise<EstablishmentListItemDTO[]>;
}

export type UserListItemDTO = {
    id: string;
    fullName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

export type UserDetailsDTO = {
    id: string;
    fullName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    favoriteEstablishmentId: string | null;
};

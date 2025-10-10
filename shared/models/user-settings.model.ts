export default class UserSettingsModel {
    userId: string;
    favorite_establishment_id: string | null;

    constructor({
        userId,
        favorite_establishment_id,
    }: {
        userId: string;
        favorite_establishment_id: string | null;
    }) {
        this.userId = userId;
        this.favorite_establishment_id = favorite_establishment_id;
    }

    setFavoriteEstablishment(establishmentId: string | null) {
        this.favorite_establishment_id = establishmentId;
    }
}

export type UserSettingsInsert = Omit<UserSettingsModel, "userId">;
export type UserSettingsUpdate = Partial<Omit<UserSettingsModel, "userId">>;

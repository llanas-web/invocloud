export type UserSettingsEntityProps = {
    favoriteEstablishmentId: string | null;
};

class UserSettingsEntity {
    private constructor(readonly props: UserSettingsEntityProps) {}

    static create(props: UserSettingsEntityProps): UserSettingsEntity {
        return new UserSettingsEntity(props);
    }

    get favoriteEstablishmentId() {
        return this.props.favoriteEstablishmentId;
    }

    toggleFavoriteEstablishment(
        establishmentId: string | null,
    ): UserSettingsEntity {
        const newFavoriteId =
            this.props.favoriteEstablishmentId === establishmentId
                ? null
                : establishmentId;
        return UserSettingsEntity.create({
            ...this.props,
            favoriteEstablishmentId: newFavoriteId,
        });
    }
}

export default UserSettingsEntity;

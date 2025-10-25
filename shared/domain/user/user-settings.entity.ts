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
}

export default UserSettingsEntity;

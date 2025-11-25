import type { ModelCommonUpdateProps } from "../common/common.interface";
import { DomainError, DomainErrorCode } from "../common/errors/domain.error";
import { PayloadModel } from "../common/payload.model";
import SubscriptionEntity from "./subscription.entity";
import UserSettingsEntity from "./user-settings.entity";

export type UserModelProps =
    & ModelCommonUpdateProps
    & UserRequiredProps
    & UserMutableProps;

export type UserRequiredProps = {
    email: string;
};

export type UserMutableProps = {
    fullName?: string | null;
    settings?: UserSettingsEntity | null;
    subscription: SubscriptionEntity | null;
};

export type DraftUser = Omit<
    UserModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class UserModel extends PayloadModel {
    static override payloadType: string = "UserModel";

    private constructor(readonly props: UserModelProps) {
        super();
        this.props = {
            ...props,
            settings: props.settings ?? null,
            subscription: props.subscription ?? null,
        };
    }

    static create(props: UserModelProps): UserModel {
        return new UserModel(props);
    }

    // ─── Core getters ───
    get id() {
        return this.props.id;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    // ─── Required fields ───
    get email() {
        return this.props.email;
    }
    // ─── Optional fields ───
    get fullName() {
        return this.props.fullName ?? null;
    }

    get favoriteEstablishmentId(): string | null {
        return this.props.settings?.favoriteEstablishmentId ?? null;
    }

    get settings(): UserSettingsEntity | null {
        return this.props.settings ?? null;
    }

    get subscription(): SubscriptionEntity | null {
        return this.props.subscription ?? null;
    }

    withDetails(details: Partial<UserMutableProps>): UserModel {
        return UserModel.create({
            ...this.props,
            ...details,
        });
    }

    toggleFavoriteEstablishment(establishmentId: string | null): UserModel {
        const newSettings = this.props.settings
            ? this.props.settings.toggleFavoriteEstablishment(establishmentId)
            : UserSettingsEntity.create({
                favoriteEstablishmentId: establishmentId,
            });

        return UserModel.create({
            ...this.props,
            settings: newSettings,
        });
    }

    // ─── Business Logic: Subscription Management ───

    /**
     *  Indicates if the user has an active subscription.
     */
    hasActiveSubscription() {
        return this.props.subscription !== null &&
            this.props.subscription.isActive();
    }

    /**
     * Ajoute un abonnement à l'utilisateur.
     */
    withSubscription(subscription: SubscriptionEntity): UserModel {
        if (this.props.subscription !== null) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "L'utilisateur possède déjà un abonnement",
            );
        }
        return UserModel.create({
            ...this.props,
            subscription,
        });
    }

    updateSubscription(
        updater: (subscription: SubscriptionEntity) => SubscriptionEntity,
    ): UserModel {
        if (this.props.subscription === null) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "L'utilisateur ne possède pas d'abonnement à mettre à jour",
            );
        }
        return UserModel.create({
            ...this.props,
            subscription: updater(this.props.subscription),
        });
    }

    renewSubscription(periodEnd?: Date) {
        if (!this.hasActiveSubscription()) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "Seul un utilisateur avec un abonnement actif peut renouveler son abonnement",
            );
        }
        return this.updateSubscription(
            (subscription) => subscription.renew(periodEnd),
        );
    }

    cancelSubscription(endDate: Date) {
        if (!this.hasActiveSubscription()) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "Seul un utilisateur avec un abonnement actif peut annuler son abonnement",
            );
        }
        return this.updateSubscription(
            (subscription) => subscription.cancel(endDate),
        );
    }

    reactivateSubscription(): any {
        if (this.hasActiveSubscription()) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "L'utilisateur possède déjà un abonnement actif",
            );
        }
        return this.updateSubscription(
            (subscription) => subscription.activate(),
        );
    }

    removeSubscription() {
        if (this.props.subscription === null) {
            throw new DomainError(
                DomainErrorCode.INVALID_OPERATION,
                "L'utilisateur ne possède pas d'abonnement à supprimer",
            );
        }
        return UserModel.create({
            ...this.props,
            subscription: null,
        });
    }

    // ─── Payload methods ───

    override toPayload(): Record<string, any> {
        return {
            id: this.id,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            fullName: this.fullName,
            settings: this.props.settings && {
                favoriteEstablishmentId:
                    this.props.settings.favoriteEstablishmentId,
            },
            subscription: this.props.subscription
                ? {
                    status: this.props.subscription.status,
                    startAt: this.props.subscription.startAt,
                    endAt: this.props.subscription.endAt,
                    providerSubscriptionId:
                        this.props.subscription.providerSubscriptionId,
                    providerCustomerId:
                        this.props.subscription.providerCustomerId,
                }
                : null,
        };
    }

    override fromPayload(data: any): this {
        return UserModel.create({
            id: data.id,
            email: data.email,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            fullName: data.fullName,
            settings: data.settings && {
                favoriteEstablishmentId: data.settings.favoriteEstablishmentId,
            },
            subscription: data.subscription
                ? SubscriptionEntity.create(data.subscription)
                : null,
        }) as this;
    }
}

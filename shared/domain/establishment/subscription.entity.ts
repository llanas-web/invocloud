import { DomainError, DomainErrorCode } from "../common/errors/domain.error";

export enum SubscriptionStatus {
    // inactive, trial, active, canceled
    TRIALING = "trialing",
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELED = "canceled",
}

export type SubscriptionEntityProps = {
    status: SubscriptionStatus;
    createdAt: Date;
    startAt: Date;
    endAt: Date | null;
    // cancelAt: Date | null;
    // canceledAt: Date | null;
    // currentPeriodStart: Date;
    // currentPeriodEnd: Date;
    providerSubscriptionId?: string | null;
    providerCustomerId?: string | null;
};

/**
 * Entity Subscription - fait partie de l'aggregate Establishment
 * Représente l'abonnement Stripe d'un établissement
 */
class SubscriptionEntity {
    createdAt: Date = new Date();
    provider = "stripe";
    private constructor(readonly props: SubscriptionEntityProps) {}

    static create(props: SubscriptionEntityProps): SubscriptionEntity {
        return new SubscriptionEntity(props);
    }

    static createTrial(
        trialEndDate: Date,
        providerSubscriptionId?: string,
        providerCustomerId?: string,
    ): SubscriptionEntity {
        const now = new Date();
        return new SubscriptionEntity({
            status: SubscriptionStatus.TRIALING,
            startAt: now,
            createdAt: now,
            endAt: trialEndDate,
            providerSubscriptionId,
            providerCustomerId,
        });
    }

    get status() {
        return this.props.status;
    }

    get startAt() {
        return this.props.startAt;
    }

    get endAt() {
        return this.props.endAt;
    }

    get providerSubscriptionId() {
        return this.props.providerSubscriptionId;
    }

    get providerCustomerId() {
        return this.props.providerCustomerId;
    }

    // Business logic
    isActive(): boolean {
        return this.props.status === SubscriptionStatus.ACTIVE ||
            this.props.status === SubscriptionStatus.TRIALING;
    }

    isTrialing(): boolean {
        return this.props.status === SubscriptionStatus.TRIALING;
    }

    isCanceled(): boolean {
        return this.props.status === SubscriptionStatus.CANCELED;
    }

    canBeDeleted(): boolean {
        return !this.isActive();
    }

    /**
     * Active l'abonnement (sortie de période d'essai)
     */
    activate(): SubscriptionEntity {
        if (!this.isActive()) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "Seul un abonnement en essai, actif ou annulé peut être renouvellé",
            );
        }
        return this.updateStatus(SubscriptionStatus.ACTIVE);
    }

    /**
     *  Renouvelle l'abonnement
     */
    renew(periodEnd?: Date): SubscriptionEntity {
        if (!this.isActive()) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "Seul un abonnement actif peut être renouvelé",
            );
        }
        return this.updatePeriod(
            this.props.startAt,
            periodEnd ?? undefined,
        );
    }

    /**
     * Met à jour le statut de l'abonnement
     */
    updateStatus(status: SubscriptionStatus): SubscriptionEntity {
        return new SubscriptionEntity({
            ...this.props,
            status,
        });
    }

    /**
     * Met à jour les périodes de facturation
     */
    updatePeriod(
        currentPeriodStart: Date,
        currentPeriodEnd?: Date,
    ): SubscriptionEntity {
        return new SubscriptionEntity({
            ...this.props,
            startAt: currentPeriodStart,
            endAt: currentPeriodEnd ?? null,
        });
    }

    cancel(endDate?: Date): SubscriptionEntity {
        if (this.isCanceled()) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "L'abonnement est déjà annulé",
            );
        }
        return new SubscriptionEntity({
            ...this.props,
            status: SubscriptionStatus.CANCELED,
            endAt: endDate ?? new Date(),
        });
    }
}

export default SubscriptionEntity;

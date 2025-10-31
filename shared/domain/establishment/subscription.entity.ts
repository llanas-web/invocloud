export enum SubscriptionStatus {
    // inactive, trial, active, canceled
    TRIALING = "trialing",
    ACTIVE = "active",
    PAST_DUE = "past_due",
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
            // cancelAt: null,
            // canceledAt: null,
            // currentPeriodStart: now,
            // currentPeriodEnd: trialEndDate,
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

    // get cancelAt() {
    //     return this.props.cancelAt;
    // }

    // get canceledAt() {
    //     return this.props.canceledAt;
    // }

    // get currentPeriodStart() {
    //     return this.props.currentPeriodStart;
    // }

    // get currentPeriodEnd() {
    //     return this.props.currentPeriodEnd;
    // }

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

    canBeDeleted(): boolean {
        return !this.isActive();
    }

    /**
     * Active l'abonnement (sortie de période d'essai)
     */
    activate(periodEnd: Date, periodStart?: Date): SubscriptionEntity {
        if (!this.isActive()) {
            throw new Error(
                "Seul un abonnement en essai, actif ou annulé peut être renouvellé",
            );
        }
        return new SubscriptionEntity({
            ...this.props,
            status: SubscriptionStatus.ACTIVE,
            endAt: periodEnd,
            // currentPeriodStart: periodStart ?? new Date(),
        });
    }

    /**
     *  Renouvelle l'abonnement
     */
    renew(periodEnd?: Date): SubscriptionEntity {
        if (!this.isActive()) {
            throw new Error(
                "Seul un abonnement actif peut être renouvelé",
            );
        }
        return new SubscriptionEntity({
            ...this.props,
            status: SubscriptionStatus.ACTIVE,
            endAt: periodEnd ?? this.props.endAt,
        });
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
        currentPeriodEnd: Date,
    ): SubscriptionEntity {
        return new SubscriptionEntity({
            ...this.props,
            startAt: currentPeriodStart,
            endAt: currentPeriodEnd,
        });
    }
}

export default SubscriptionEntity;

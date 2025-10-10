export enum SubscriptionProvider {
    STRIPE = "stripe",
    PAYPAL = "paypal",
}

export enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    CANCELED = "canceled",
    TRIAL = "trial",
}

export class SubscriptionModel {
    establishmentId: string;
    provider: SubscriptionProvider;
    providerSubscriptionId: string;
    providerCustomerId: string;
    status: SubscriptionStatus;
    startedAt: Date;
    endAt: Date;

    constructor(
        establishmentId: string,
        provider: SubscriptionProvider,
        providerSubscriptionId: string,
        providerCustomerId: string,
        status: SubscriptionStatus,
        startedAt: Date,
        endAt: Date,
    ) {
        this.establishmentId = establishmentId;
        this.provider = provider;
        this.providerSubscriptionId = providerSubscriptionId;
        this.providerCustomerId = providerCustomerId;
        this.status = status;
        this.startedAt = startedAt;
        this.endAt = endAt;
    }
}

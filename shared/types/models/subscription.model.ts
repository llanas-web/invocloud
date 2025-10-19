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
    id: string;
    establishmentId: string;
    provider: SubscriptionProvider;
    providerSubscriptionId: string;
    providerCustomerId: string;
    status: SubscriptionStatus;
    startedAt: Date;
    endAt: Date | null;

    constructor({
        id,
        establishmentId,
        provider,
        providerSubscriptionId,
        providerCustomerId,
        status,
        startedAt,
        endAt,
    }: {
        id: string;
        establishmentId: string;
        provider: SubscriptionProvider;
        providerSubscriptionId: string;
        providerCustomerId: string;
        status: SubscriptionStatus;
        startedAt: Date;
        endAt: Date | null;
    }) {
        this.id = id;
        this.establishmentId = establishmentId;
        this.provider = provider;
        this.providerSubscriptionId = providerSubscriptionId;
        this.providerCustomerId = providerCustomerId;
        this.status = status;
        this.startedAt = startedAt;
        this.endAt = endAt;
    }
}

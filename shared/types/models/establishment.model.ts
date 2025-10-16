import type { SubscriptionModel } from "./subscription.model";

export class EstablishmentModel {
    id: string;
    name: string;
    emailPrefix: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    address: string | null;
    phone: string | null;
    subscription: SubscriptionModel | null = null;

    constructor(
        id: string,
        name: string,
        emailPrefix: string,
        creatorId: string,
        createdAt: Date,
        updatedAt: Date,
        address: string | null,
        phone: string | null,
    ) {
        this.id = id;
        this.name = name;
        this.emailPrefix = emailPrefix;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.address = address;
        this.phone = phone;
    }

    setSubscription(subscription: SubscriptionModel) {
        this.subscription = subscription;
    }
}

export type EstablishmentShortModel = Pick<
    EstablishmentModel,
    "id" | "name"
>;

export type EstablishmentModelInsert = Pick<
    EstablishmentModel,
    "name" | "creatorId" | "emailPrefix"
>;

export type EstablishmentModelUpdate = Partial<
    Omit<EstablishmentModel, "id" | "createdAt" | "creatorId" | "subscription">
>;

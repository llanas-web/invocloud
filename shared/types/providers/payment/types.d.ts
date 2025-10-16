export type PaymentProviderName = "stripe";

export type SubscriptionEvent = "created" | "updated" | "deleted";

export type PaymentSession = {
    url: string;
    id: string;
};

export type SubscriptionPlanDTO = {
    id: string;
    name: string;
    providerProductId: string;
    subscriptionPriceId: string;
    metricPriceId: string;
    includedInvoicesPerMonth: number;
    pricePerMonthCents: number;
    createdAt: Date;
    maxEstablishments: number;
    maxMembers: number;
    hasOcrFeature: boolean;
    hasInboundFeature: boolean;
};

export interface PaymentRepository {
    createCheckoutSession(
        userId: string,
        establishmentId: string,
    ): Promise<string>;
    createSubscription(
        userEmail: string,
        establishmentId: string,
    ): Promise<string>;
    cancelSubscription(subscriptionId: string): Promise<number>;
    cancelTrialingPeriod(subscriptionId: string): Promise<void>;
}

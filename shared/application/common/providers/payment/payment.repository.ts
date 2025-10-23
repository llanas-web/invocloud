export interface PaymentRepository {
    createCheckoutSession(
        email: string,
        userId: string,
        establishmentId: string,
    ): Promise<string>;
    cancelSubscription(subscriptionId: string): Promise<number>;
    cancelTrialingPeriod(subscriptionId: string): Promise<void>;
}

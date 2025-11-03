import type { CreateCheckoutSessionDto } from "./dtos/payment-event.dto";

export interface PaymentRepository {
    createCheckoutSession(
        createCheckoutSessionDto: CreateCheckoutSessionDto,
    ): Promise<string | null>;
    cancelSubscription(subscriptionId: string): Promise<number>;
    cancelTrialingPeriod(subscriptionId: string): Promise<void>;
}

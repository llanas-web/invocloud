import type { UserModel } from "~~/shared/types/models/user.model";
import type {
    PaymentSession,
    SubscriptionEvent,
} from "~~/shared/types/providers/payment/types";

export interface PaymentProviderInterface {
    createSubscription(
        userId: string,
        userEmail: string,
        establishmentId: string,
    ): Promise<PaymentSession>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    cancelTrialingPeriod(subscriptionId: string): Promise<void>;
}

import type { UserModel } from "~~/shared/types/models/user.model";
import type {
    PaymentSession,
    SubscriptionEvent,
} from "~~/shared/types/providers/payment/types";

export interface PaymentProviderInterface {
    onSubscriptionChange(
        callback: (event: SubscriptionEvent, subscriptionId: string) => void,
    ): void;
    createSubscription(
        user: UserModel,
        establishmentId: string,
    ): Promise<PaymentSession>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    cancelTrialingPeriod(subscriptionId: string): Promise<void>;
}

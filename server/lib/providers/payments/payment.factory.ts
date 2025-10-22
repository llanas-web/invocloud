import type { PaymentRepository } from "../../../../shared/application/common/providers/payment/payment.repository";
import { PaymentStripeRepository } from "./stripe/payment.stripe.repository";

class PaymentFactory {
    private static instance: PaymentRepository;

    private constructor(providerName: string) {
        PaymentFactory.instance = this.createProvider(providerName);
    }

    private createProvider(name: string): PaymentRepository {
        switch (name) {
            case "stripe":
                return new PaymentStripeRepository();
            // case "paypal":
            //     return new PaypalProvider();
            default:
                throw new Error(`Unknown payment provider: ${name}`);
        }
    }

    public static getInstance(providerName: string): PaymentRepository {
        if (!PaymentFactory.instance) {
            new PaymentFactory(providerName);
        }
        return PaymentFactory.instance;
    }
}

export default PaymentFactory;

import type { PaymentProviderInterface } from "./payment.interface";
import { StripeRepository } from "./stripe/stripe.repository";

class PaymentFactory {
    private static instance: PaymentProviderInterface;

    private constructor(providerName: string) {
        PaymentFactory.instance = this.createProvider(providerName);
    }

    private createProvider(name: string): PaymentProviderInterface {
        switch (name) {
            case "stripe":
                return new StripeRepository();
            // case "paypal":
            //     return new PaypalProvider();
            default:
                throw new Error(`Unknown payment provider: ${name}`);
        }
    }

    public static getInstance(providerName: string): PaymentProviderInterface {
        if (!PaymentFactory.instance) {
            new PaymentFactory(providerName);
        }
        return PaymentFactory.instance;
    }
}

export default PaymentFactory;

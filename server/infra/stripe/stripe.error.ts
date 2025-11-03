import { Stripe } from "stripe";
import { InfraError } from "~~/shared/infra/common/infra.error";

export class StripeError extends InfraError {
    constructor(
        code: string,
        message: string,
    ) {
        super(code, message);
        this.name = "StripeError";
    }

    static fromStripeError(err: Stripe.errors.StripeError) {
        return new StripeError(
            err.code ?? "STRIPE_ERROR",
            err.message ?? "Une erreur Stripe est survenue",
        );
    }
}

import type Stripe from "stripe";
import PaymentError from "../../../../../../shared/application/common/providers/payment/payment.error";

export const generateCreateCheckoutSessionObject = (
    userEmail: string,
    establishmentId: string,
): Stripe.Checkout.SessionCreateParams => {
    const priceId = process.env.STRIPE_PRICE_ID!;
    const baseUrl = process.env.BASE_URL;

    if (!priceId || !baseUrl) {
        throw new PaymentError("Missing required environment variables");
    }

    return {
        mode: "subscription",
        customer_email: userEmail,
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        subscription_data: {
            trial_period_days: 7,
        },
        success_url: `${baseUrl}/app?subscription_success=true`,
        cancel_url: `${baseUrl}/app/settings/establishments?cancel=true`,
        metadata: {
            establishmentId,
        },
    };
};

export const mapCheckoutSessionToPaymentSession = (
    checkoutSession: Stripe.Checkout.Session,
) => {
    if (!checkoutSession.url) {
        throw new PaymentError("Checkout session does not have a URL");
    }
    return {
        url: checkoutSession.url,
        id: checkoutSession.id,
    };
};

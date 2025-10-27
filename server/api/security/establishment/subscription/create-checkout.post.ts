import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { CreateCheckoutSessionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/create-checkout.contract";

export default defineEventHandler(async (event) => {
    const { establishments } = useServerUsecases(event);

    const { establishmentId } = await parseBody(
        event,
        CreateCheckoutSessionBodySchema,
    );

    const checkoutUrl = await establishments.subscription
        .createCheckoutSession
        .execute({ establishmentId });
    // Redirect to Stripe Checkout
    return checkoutUrl;
});

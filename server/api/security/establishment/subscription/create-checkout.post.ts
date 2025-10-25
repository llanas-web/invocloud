import { HTTPStatus } from "~~/server/core/errors/status";
import { CreateCheckoutSessionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/create-checkout.contract";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";

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
    sendRedirect(event, checkoutUrl);
});

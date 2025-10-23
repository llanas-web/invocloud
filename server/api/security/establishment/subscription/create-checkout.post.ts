import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { AuthUserModel } from "~~/shared/types/models/auth-user.model";
import { CreateCheckoutSessionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/create-checkout.contract";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";

export default defineEventHandler(async (event) => {
    const {
        deps: {
            auth,
        },
    } = await buildRequestScope(event);
    const usecases = useServerUsecases(event);

    const { establishmentId } = await parseBody(
        event,
        CreateCheckoutSessionBodySchema,
    );
    if (auth.currentUser === null || auth.currentUser.isAnonymous === true) {
        throw createError({ status: HTTPStatus.FORBIDDEN });
    }
    const { id, email } = auth.currentUser as AuthUserModel;
    const checkoutUrl = await usecases.establishments.subscription
        .createCheckoutSession
        .execute({
            userId: id,
            email: email,
            establishmentId,
        });
    // Redirect to Stripe Checkout
    sendRedirect(event, checkoutUrl);
});

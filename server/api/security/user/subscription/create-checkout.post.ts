import { useServerDi } from "~~/server/middleware/injection.middleware";
import { CreateCheckoutSessionBodySchema } from "~~/shared/contracts/api/security/users/subscription/create-checkout.contract";
import CreateCheckoutSessionUsecase from "~~/shared/application/user/usecases/subscription/create-checkout-session.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, authRepository, paymentRepository } =
            useServerDi(
                event,
            );

        const { userId, subscriptionPlanId } = await parseBody(
            event,
            CreateCheckoutSessionBodySchema,
        );

        const createCheckoutSessionUsecase = new CreateCheckoutSessionUsecase(
            repos,
            queries,
            authRepository,
            paymentRepository,
        );
        const checkoutUrl = await createCheckoutSessionUsecase
            .execute({ userId, subscriptionPlanId });
        return checkoutUrl;
    } catch (error) {
        return handleError(error);
    }
});

import { useServerDi } from "~~/server/middleware/injection.middleware";
import {
    ActivateSubscriptionBodySchema,
} from "~~/shared/contracts/api/security/establishments/subscription/activate.contract";
import ActivateSubscriptionUsecase from "~~/shared/application/user/usecases/subscription/activate-subscription.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, paymentRepository } = useServerDi(event);
        const { userId, subscriptionPlanId } = await parseBody(
            event,
            ActivateSubscriptionBodySchema,
        );

        const activateSubscriptionUsecase = new ActivateSubscriptionUsecase(
            repos,
            queries,
            paymentRepository,
        );

        await activateSubscriptionUsecase.execute({
            userId,
            subscriptionPlanId,
        });
    } catch (error) {
        return handleError(error);
    }
});

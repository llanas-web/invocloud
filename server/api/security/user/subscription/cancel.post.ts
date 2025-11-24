import { useServerDi } from "~~/server/middleware/injection.middleware";
import { CancelSubscriptionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/cancel.contract";
import CancelSubscriptionUsecase from "~~/shared/application/user/usecases/subscription/cancel-subscription.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, paymentRepository } = useServerDi(event);
        const { userId } = await parseBody(
            event,
            CancelSubscriptionBodySchema,
        );

        const cancelSubscriptionUsecase = new CancelSubscriptionUsecase(
            repos,
            queries,
            paymentRepository,
        );

        await cancelSubscriptionUsecase.execute({
            userId,
        });
    } catch (error) {
        return handleError(error);
    }
});

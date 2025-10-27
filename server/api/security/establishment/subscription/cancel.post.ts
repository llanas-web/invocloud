import { useServerDi } from "~~/server/middleware/injection.middleware";
import { CancelSubscriptionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/cancel.contract";
import CancelSubscriptionUsecase from "#shared/application/establishment/usecases/subscription/cancel-subscription.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries, paymentRepository } = useServerDi(event);
    const { establishmentId } = await parseBody(
        event,
        CancelSubscriptionBodySchema,
    );

    const cancelSubscriptionUsecase = new CancelSubscriptionUsecase(
        repos,
        queries,
        paymentRepository,
    );

    await cancelSubscriptionUsecase.execute({
        establishmentId,
    });
});

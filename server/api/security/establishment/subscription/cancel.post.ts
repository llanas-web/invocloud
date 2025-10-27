import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { CancelSubscriptionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/cancel.contract";

export default defineEventHandler(async (event) => {
    const { establishments } = useServerUsecases(event);

    const { establishmentId } = await parseBody(
        event,
        CancelSubscriptionBodySchema,
    );

    await establishments.subscription.cancelSubscription.execute(
        establishmentId,
    );
});

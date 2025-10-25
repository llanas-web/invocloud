import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
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

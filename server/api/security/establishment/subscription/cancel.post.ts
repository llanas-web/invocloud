import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { CancelSubscriptionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/cancel.contract";

export default defineEventHandler(async (event) => {
    const usecase = useServerUsecases(event);

    const { establishmentId } = await parseBody(
        event,
        CancelSubscriptionBodySchema,
    );

    await usecase.establishments.subscription.cancelSubscription.execute(
        establishmentId,
    );
});

import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { SubscriptionStatus } from "~~/shared/types/models/subscription.model";

const schema = z.object({
    establishmentId: z.uuid(),
});

export default defineEventHandler(async (event) => {
    const { deps: { repos: { establishmentRepository }, payment } } =
        await buildRequestScope(event);

    const { establishmentId } = await parseBody(event, schema);

    const establishments = await establishmentRepository
        .getAllEstablishments({
            ids: [establishmentId],
        });
    const establishment = establishments[0];

    if (!establishment || !establishment.subscription) {
        throw createError({ status: HTTPStatus.BAD_REQUEST });
    }

    const { providerSubscriptionId, status } = establishment.subscription!;
    switch (status) {
        case SubscriptionStatus.ACTIVE:
            await payment.cancelSubscription(providerSubscriptionId);
            break;
        case SubscriptionStatus.TRIAL:
            await payment.cancelTrialingPeriod(providerSubscriptionId);
            break;
        case SubscriptionStatus.CANCELED:
        case SubscriptionStatus.INACTIVE:
        default:
            throw createError({
                status: HTTPStatus.BAD_REQUEST,
                message: "Aucune souscription pour cet établissement",
            });
    }
});

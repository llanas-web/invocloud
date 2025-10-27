import { CheckPrefixBodySchema } from "#shared/contracts/api/security/establishments/check-prefix.contract";
import { useServerUsecases } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    const { prefix, excludeEstablishmentId } = await parseBody(
        event,
        CheckPrefixBodySchema,
    );
    const { establishments } = useServerUsecases(event);

    const isAvailable = await establishments.emailPrefixAvailable.execute({
        emailPrefix: prefix,
        excludeId: excludeEstablishmentId,
    });

    return { isAvailable };
});

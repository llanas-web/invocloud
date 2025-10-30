import { CheckPrefixBodySchema } from "#shared/contracts/api/security/establishments/check-prefix.contract";
import { handleError } from "~~/server/core/errors/handling-error";
import { useServerDi } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    try {
        const { queries } = useServerDi(event);
        const { prefix, excludeEstablishmentId } = await parseBody(
            event,
            CheckPrefixBodySchema,
        );

        const isAvailable = await queries.establishmentQuery
            .isEmailPrefixAvailable(
                prefix,
                excludeEstablishmentId,
            );

        return { isAvailable };
    } catch (error) {
        return handleError(error);
    }
});

import { CheckPrefixBodySchema } from "#shared/contracts/api/security/establishments/check-prefix.contract";
import { useServerDi } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    const { queries } = useServerDi(event);
    const { prefix, excludeEstablishmentId } = await parseBody(
        event,
        CheckPrefixBodySchema,
    );

    const isAvailable = await queries.establishmentQuery.isEmailPrefixAvailable(
        prefix,
        excludeEstablishmentId,
    );

    return { isAvailable };
});

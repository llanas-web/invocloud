import { buildRequestScope } from "~~/server/core/container";
import { z } from "zod";
import { HTTPStatus } from "~~/server/core/errors/status";
import { AuthUserModel } from "~~/shared/types/models/auth-user.model";

const schema = z.object({
    establishmentId: z.uuid(),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            auth,
            payment,
        },
    } = await buildRequestScope(event);

    const { establishmentId } = await parseBody(event, schema);
    if (auth.currentUser === null || auth.currentUser.isAnonymous === true) {
        throw createError({ status: HTTPStatus.FORBIDDEN });
    }

    const { email, id } = auth.currentUser as AuthUserModel;

    const session = await payment.createSubscription(
        id,
        email,
        establishmentId,
    );

    return session.url;
});

import { z } from "zod";
import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { InviteMemberBodySchema } from "~~/shared/contracts/api/security/establishments/invite-member.contract";

export default defineEventHandler(async (event) => {
    const { establishments } = useServerUsecases(event);

    const { email, establishmentId, invitorId } = await parseBody(
        event,
        InviteMemberBodySchema,
    );

    await establishments.member.invite.execute({
        email,
        establishmentId,
        role: "admin",
    });
});

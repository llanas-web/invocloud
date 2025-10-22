import { z } from "zod";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { InviteMemberBodySchema } from "~~/shared/contracts/api/security/establishments/invite-member.contract";

export default defineEventHandler(async (event) => {
    const usecases = useServerUsecases(event);

    const { email, establishmentId, invitorId } = await parseBody(
        event,
        InviteMemberBodySchema,
    );

    await usecases.establishments.member.invite.execute({
        email,
        establishmentId,
        invitorId,
    });
});

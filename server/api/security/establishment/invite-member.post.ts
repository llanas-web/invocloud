import * as z from "zod";
import { buildRequestScope } from "~~/server/core/container";
import ServerError from "~~/server/core/errors";
import { HTTPStatus } from "~~/server/core/errors/status";
import useInviteMemberService from "~~/server/services/invite-member.service";

const schema = z.object({
    email: z.email(),
    establishmentId: z.uuid(),
    invitorId: z.uuid(),
});

export default defineEventHandler(async (event) => {
    try {
        const { ctx, deps } = await buildRequestScope(event);
        const {
            authRepository,
        } = deps.repos;
        const {
            checkInvitorAuthorization,
            inviteMember,
        } = useInviteMemberService(deps);
        const { email, establishmentId, invitorId } = await parseBody(
            event,
            schema,
        );

        if (authRepository?.currentUser?.id !== invitorId) {
            console.error("User is not authorized to invite members");
            throw createError({
                status: 403,
                message: "Interdit",
            });
        }
        const isAuthorized = await checkInvitorAuthorization(
            invitorId,
            establishmentId,
        );
        if (!isAuthorized) {
            throw new ServerError(
                HTTPStatus.FORBIDDEN,
                "L'utilisateur n'est pas autorisé à inviter des membres",
            );
        }

        const result = await inviteMember(
            email,
            establishmentId,
            invitorId,
        );
        return result;
    } catch (error) {
        // TODO: Catch les erreurs
        console.error("Unexpected error:", error);
        throw createError({
            status: 500,
            message: "Erreur interne du serveur",
        });
    }
});

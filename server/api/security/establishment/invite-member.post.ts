import { useServerDi } from "~~/server/middleware/injection.middleware";
import { InviteMemberBodySchema } from "~~/shared/contracts/api/security/establishments/invite-member.contract";
import InviteMemberUsecase from "~~/shared/application/establishment/usecases/invite-member.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const {
            repos,
            queries,
            emailRepository,
            authRepository,
            adminRepository,
        } = useServerDi(
            event,
        );

        const { email, establishmentId, invitorId } = await parseBody(
            event,
            InviteMemberBodySchema,
        );

        const inviteMemberUsecase = new InviteMemberUsecase(
            repos,
            queries,
            emailRepository,
            authRepository,
            adminRepository,
        );

        await inviteMemberUsecase.execute({
            email,
            establishmentId,
        });
    } catch (error) {
        return handleError(error);
    }
});

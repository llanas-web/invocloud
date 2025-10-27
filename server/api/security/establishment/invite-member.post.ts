import { useServerDi } from "~~/server/middleware/injection.middleware";
import { InviteMemberBodySchema } from "~~/shared/contracts/api/security/establishments/invite-member.contract";
import InviteMemberUsecase from "~~/shared/application/establishment/usecases/invite-member.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries, emailRepository, authRepository } = useServerDi(
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
    );

    await inviteMemberUsecase.execute({
        email,
        establishmentId,
    });
});

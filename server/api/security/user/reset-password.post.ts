import { useServerDi } from "~~/server/middleware/injection.middleware";
import ResetPasswordUsecase from "~~/shared/application/user/usecases/reset-password.usecase";
import { ResetPasswordBodySchema } from "#shared/contracts/api/security/users/reset-password.contract";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, authRepository } = useServerDi(event);
        const { password } = await parseBody(event, ResetPasswordBodySchema);
        const userId = authRepository.connectedUser!.id;

        const resetPasswordUsecase = new ResetPasswordUsecase(
            repos,
            queries,
            authRepository,
        );

        await resetPasswordUsecase.execute({ userId, newPassword: password });
    } catch (error) {
        return handleError(error);
    }
});

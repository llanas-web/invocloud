import { useServerDi } from "~~/server/middleware/injection.middleware";
import ResetPasswordUsecase from "~~/shared/application/user/usecases/reset-password.usecase";
import { ResetPasswordBodySchema } from "#shared/contracts/api/security/users/reset-password.contract";

export default defineEventHandler(async (event) => {
    const { repos, queries, authRepository } = useServerDi(event);
    const { password } = await parseBody(event, ResetPasswordBodySchema);
    const userId = authRepository.connectedUser!.id;

    const resetPasswordUsecase = new ResetPasswordUsecase(
        repos,
        queries,
        authRepository,
    );

    await resetPasswordUsecase.execute({ userId, newPassword: password });
});

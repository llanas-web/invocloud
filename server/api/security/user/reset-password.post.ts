import { useServerDi } from "~~/server/middleware/injection.middleware";
import { ResetPasswordSchema } from "~~/shared/contracts/api/security/users/reset-password.contract";
import ResetPasswordUsecase from "~~/shared/application/user/usecases/reset-password.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries, authRepository } = useServerDi(event);
    const { password } = await parseBody(event, ResetPasswordSchema);
    const userId = authRepository.connectedUser!.id;

    const resetPasswordUsecase = new ResetPasswordUsecase(
        repos,
        queries,
        authRepository,
    );

    await resetPasswordUsecase.execute({ userId, newPassword: password });
});

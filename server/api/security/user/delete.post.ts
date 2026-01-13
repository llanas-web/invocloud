import { useServerDi } from "~~/server/middleware/injection.middleware";
import DeleteUserUsecase from "~~/shared/application/user/usecases/delete-user.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, authRepository, adminRepository } = useServerDi(
            event,
        );
        const userId = authRepository.connectedUser!.id;
        const deleteUserUsecase = new DeleteUserUsecase(
            queries,
            adminRepository,
        );
        await deleteUserUsecase.execute({ userId });
        authRepository.signOut();
    } catch (error) {
        return handleError(error);
    }
});

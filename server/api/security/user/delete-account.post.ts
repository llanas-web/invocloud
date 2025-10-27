import { useServerDi } from "~~/server/middleware/injection.middleware";
import { DeleteAccountSchema } from "~~/shared/contracts/api/security/users/delete-account.contract";
import DeleteUserUsecase from "~~/shared/application/user/usecases/delete-user.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries } = useServerDi(event);
    const { userId } = await parseBody(event, DeleteAccountSchema);

    const deleteUserAccountUsecase = new DeleteUserUsecase(
        repos,
        queries,
    );

    await deleteUserAccountUsecase.execute({
        userId,
    });
});

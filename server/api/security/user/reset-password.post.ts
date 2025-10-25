import * as z from "zod";
import { useServerAuthRepository } from "~~/server/plugins/auth.plugin";

const schema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default defineEventHandler(async (event) => {
    const authRepository = useServerAuthRepository(event);

    const { password } = await parseBody(event, schema);

    await authRepository.updateUser(authRepository.connectedUser!.id, {
        password,
    });
});

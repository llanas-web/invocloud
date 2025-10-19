import { buildRequestScope } from "~~/server/core/container";

export default defineEventHandler(async (event) => {
    const {
        ctx: { authentProtection, userId },
        deps: { database: { userRepository } },
    } = await buildRequestScope(event);
    authentProtection();

    await userRepository.deleteUser(userId);
});

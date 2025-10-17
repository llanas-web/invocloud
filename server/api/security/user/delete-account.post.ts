import { buildRequestScope } from "~~/server/core/container";

export default defineEventHandler(async (event) => {
    const {
        ctx: { authentProtection, userId },
        deps: { repos: { userRepository } },
    } = await buildRequestScope(event);
    authentProtection();

    await userRepository.deleteUser(userId);
});

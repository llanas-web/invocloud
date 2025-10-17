import * as z from "zod";
import { buildRequestScope } from "~~/server/core/container";

const schema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default defineEventHandler(async (event) => {
    const {
        ctx: { authentProtection, userId },
        deps: { auth },
    } = await buildRequestScope(event);
    authentProtection();

    const { password } = await parseBody(event, schema);

    await auth.updateUser(userId, { password });
});

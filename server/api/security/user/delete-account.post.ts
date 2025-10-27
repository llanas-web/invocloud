import z from "zod";
import { useServerUsecases } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    const { users } = useServerUsecases(event);
    const parsedBody = await parseBody(event, z.object({ userId: z.uuid() }));

    await users.delete.execute(parsedBody.userId);
});

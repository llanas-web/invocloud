import type { z } from "zod";
import { AppError } from "~/core/errors/app.error";

const parseBody = (schema: z.ZodObject, body: any) => {
    const { success, data, error } = schema.safeParse(body);
    if (!success) {
        throw new AppError("Invalid request body", {
            details: error,
        });
    }
    return data;
};
export default parseBody;

import { z } from "zod";
import type { H3Event } from "h3";

export async function parseBody<TSchema extends z.ZodTypeAny>(
    event: H3Event,
    schema: TSchema,
): Promise<z.output<TSchema>> {
    const body = await readBody<z.input<TSchema>>(event);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        throw createError({
            statusCode: 403,
            statusMessage: "Données de requête invalides",
            data: parsed.error.message,
        });
    }
    return parsed.data;
}

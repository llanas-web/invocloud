import { z } from "zod";
import type { H3Event } from "h3";

export async function parseBody<TSchema extends z.ZodTypeAny>(
    event: H3Event,
    schema: TSchema,
): Promise<z.output<TSchema>> {
    // What we receive should match the *input* of the schema
    const body = await readBody<z.input<TSchema>>(event);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        // In h3, the canonical keys are statusCode/statusMessage
        throw createError({
            statusCode: 400,
            statusMessage: "Données de requête invalides",
            data: parsed.error.flatten(),
        });
    }
    return parsed.data; // typed as z.output<TSchema>
}

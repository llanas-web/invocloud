import {
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import * as z from "zod";
import { Database } from "~/types/database.types";

const schema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default defineEventHandler(async (event) => {
    const body = await readBody<typeof schema>(event);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        throw createError({
            status: 400,
            message: "Invalid request data",
        });
    }
    const { password } = parsed.data;

    const currentUser = await serverSupabaseUser(event);
    if (!currentUser) {
        console.error("User is not authenticated");
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event);
    const { data, error } = await supabaseServiceRole.auth.admin.updateUserById(
        currentUser.id,
        {
            password,
        },
    );
    if (error) {
        console.error("Error updating user:", error);
        throw createError({
            status: 500,
            message: "Internal Server Error",
        });
    }

    return data;
});

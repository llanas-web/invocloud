import {
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import * as z from "zod";
import { parseBody } from "~~/server/lib/common";
import { Database } from "~~/types/database.types";

const schema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default defineEventHandler(async (event) => {
    const { password } = await parseBody(event, schema);

    const currentUser = await serverSupabaseUser(event);
    if (!currentUser) {
        console.error("User is not authenticated");
        throw createError({
            status: 401,
            message: "Non autorisé",
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
            message: "Erreur lors de la mise à jour de l'utilisateur",
        });
    }

    return data;
});

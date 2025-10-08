import {
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
    const currentUser = await serverSupabaseUser(event);
    if (!currentUser) {
        console.error("User is not authenticated");
        throw createError({
            status: 401,
            message: "Non autorisé",
        });
    }

    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event);
    const { data, error } = await supabaseServiceRole.auth.admin.deleteUser(
        currentUser.id,
    );
    if (error) {
        console.error("Error deleting user:", error);
        throw createError({
            status: 500,
            message: "Erreur lors de la suppression du compte utilisateur",
        });
    }

    return data;
});

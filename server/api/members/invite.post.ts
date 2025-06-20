import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";
import * as z from "zod";
import { Database } from "~/types/database.types";

const schema = z.object({
    email: z.string().email(),
    establishmentId: z.string().uuid(),
    invitorId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const redirectTo = `${config.public.baseUrl}/auth/callback`;

    const body = await readBody<typeof schema>(event);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        throw createError({
            status: 400,
            message: "Invalid request data",
        });
    }
    const { email, establishmentId, invitorId } = parsed.data;

    const supabaseClient = await serverSupabaseClient<Database>(event);

    // 1. Check if the user is authenticated
    const { data: session, error: authError } = await supabaseClient.auth
        .getSession();
    if (authError || !session) {
        console.error("Authentication error:", authError);
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }
    const userId = session.session?.user.id;
    if (userId !== invitorId) {
        console.error("User is not authorized to invite members");
        throw createError({
            status: 403,
            message: "Forbidden",
        });
    }
    // 2. Check if the establishment exists
    const { data: establishment, error: establishmentError } =
        await supabaseClient
            .from("establishments")
            .select("*")
            .eq("id", establishmentId)
            .single();
    if (establishmentError || !establishment) {
        console.error("Establishment not found:", establishmentError);
        throw createError({
            status: 404,
            message: "Establishment not found",
        });
    }
    // 3. Check if the user is already a member of the establishment
    if (establishment.creator_id !== userId) {
        const { data: existingMember, error: memberError } =
            await supabaseClient
                .from("establishment_members")
                .select("*")
                .eq("user_id", userId)
                .eq("establishment_id", establishmentId)
                .single();
        if (memberError) {
            console.error("Error checking existing member:", memberError);
            throw createError({
                status: 500,
                message: "Internal server error",
            });
        }
        if (existingMember) {
            console.error("User is already a member of the establishment");
            throw createError({
                status: 409,
                message: "Conflict",
            });
        }
    }

    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event);

    // 5 Check if the member already exists in supabase
    const { data: existingUser, error: userError } = await supabaseServiceRole
        .from("users")
        .select("*")
        .eq("email", email);

    if (userError) {
        console.error("Error checking existing user:", userError);
        throw createError({
            status: 500,
            message: "Internal server error",
        });
    }

    if (existingUser && existingUser.length > 0) {
        const { data, error } = await supabaseServiceRole
            .from("establishment_members")
            .insert({
                user_id: existingUser[0].id,
                establishment_id: establishmentId,
            });
        if (error || !data) {
            console.error(
                "Error adding existing user to establishment:",
                error,
            );
            throw createError({
                status: 500,
                message: "Failed to add existing user to establishment",
            });
        }
        console.log("Existing user added to establishment successfully");
    } else {
        const { data: inviteData, error: inviteError } =
            await supabaseServiceRole
                .auth.admin
                .inviteUserByEmail(email, {
                    data: {
                        establishment_id: establishmentId,
                        invitor_id: userId,
                    },
                    redirectTo,
                });

        if (inviteError || !inviteData) {
            console.error("Error sending invitation email:", inviteError);
            throw createError({
                status: 500,
                message: "Failed to send invitation email",
            });
        }
    }
    return {
        success: true,
        message: "Member invited successfully",
    };
});

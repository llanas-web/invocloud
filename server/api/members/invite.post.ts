import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";
import { format } from "date-fns";
import * as z from "zod";
import { sendEmail } from "~~/server/lib/email";
import { Database } from "~~/types/database.types";

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
            message: "Données de requête invalides",
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
            message: "Utilisateur non authentifié",
        });
    }
    const userId = session.session?.user.id;
    if (userId !== invitorId) {
        console.error("User is not authorized to invite members");
        throw createError({
            status: 403,
            message: "Interdit",
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
            message: "Établissement non trouvé",
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
                message: "Erreur lors de la vérification de l'adhésion",
            });
        }
        if (existingMember) {
            console.error("User is already a member of the establishment");
            throw createError({
                status: 409,
                message:
                    "Conflict: L'utilisateur est déjà membre de l'établissement",
            });
        }
    }

    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event);

    // 5 Check if the member already exists in supabase
    const { data: existingUser, error: userError } = await supabaseServiceRole
        .from("users")
        .select("*")
        .eq("email", email).single();

    if (userError) {
        console.error("Error checking existing user:", userError);
        throw createError({
            status: 500,
            message: "Erreur interne du serveur",
        });
    }

    if (existingUser != null) {
        const { error } = await supabaseServiceRole
            .from("establishment_members")
            .insert({
                user_id: existingUser.id,
                establishment_id: establishmentId,
            });
        if (error) {
            console.error(
                "Error adding existing user to establishment:",
                error,
            );
            throw createError({
                status: 500,
                message:
                    "Erreur lors de l'ajout de l'utilisateur existant à l'établissement",
            });
        }
        console.log("Existing user added to establishment successfully");

        const emailSend = await sendEmail(
            [existingUser.email],
            "Vous avez été ajouté à un établissement",
            `Bonjour ${existingUser.full_name || existingUser.email},<br><br>` +
                `Vous avez été ajouté à l'établissement <strong>${establishment.name}</strong> par <strong>${
                    session.session!.user.email
                }</strong>.<br><br>`,
        );
        if (!emailSend) {
            console.error("Error sending email");
            throw createError({
                status: 500,
                message: "Erreur lors de l'envoi de l'email de confirmation",
            });
        }
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
                message: "Erreur lors de l'envoi de l'email d'invitation",
            });
        }
    }
    return {
        success: true,
        message: "Membre invité avec succès",
    };
});

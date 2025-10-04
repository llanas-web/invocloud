import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";
import { format } from "date-fns";
import * as z from "zod";
import { sendEmail } from "~~/server/lib/email";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";
import createUserRepository from "#shared/repositories/user.repository";
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
    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseServiceRole,
    );
    const userRepository = createUserRepository(supabaseServiceRole);

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
    const { data: establishments, error: establishmentError } =
        await establishmentRepository.getEstablishmentsByIds([establishmentId]);
    if (establishmentError || establishments.length === 0) {
        console.error("Establishment not found:", establishmentError);
        throw createError({
            status: 404,
            message: "Établissement non trouvé",
        });
    }
    const establishment = establishments[0];
    // 3. Check if the user is already a member of the establishment
    if (establishment.creator_id !== userId) {
        const { data: establishmentMembers, error: memberError } =
            await establishmentRepository.getEstablishmentsMembers(
                establishmentId,
            );
        if (memberError) {
            console.error("Error checking existing member:", memberError);
            throw createError({
                status: 500,
                message: "Erreur lors de la vérification de l'adhésion",
            });
        }
        if (
            establishmentMembers.length > 0 &&
            establishmentMembers.findIndex((member) =>
                    member.user_id === userId
                ) !== -1
        ) {
            console.error("User is already a member of the establishment");
            throw createError({
                status: 409,
                message:
                    "Conflict: L'utilisateur est déjà membre de l'établissement",
            });
        }
    }

    // 5 Check if the member already exists in supabase
    const { data: existingUser, error: userError } = await userRepository
        .getUserByEmail(email);

    if (userError) {
        throw createError({
            status: 500,
            message: "Erreur interne du serveur",
        });
    }

    if (existingUser != null) {
        const { error } = await establishmentRepository
            .addMemberToEstablishment(
                establishmentId,
                existingUser.id,
            );
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

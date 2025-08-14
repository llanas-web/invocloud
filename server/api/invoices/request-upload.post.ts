import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { z } from "zod";
import { Database } from "~/types/database.types";
import { generateCode, hashCode } from "~/utils/hash";

const schema = z.object({
    senderEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

type SupabaseClient = Awaited<
    ReturnType<typeof serverSupabaseClient<Database>>
>;

const parseBody = async (event: any) => {
    const body = await readBody<typeof schema>(event);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        throw createError({
            status: 400,
            message: "Données de requête invalides",
        });
    }
    return parsed.data;
};

export default defineEventHandler(async (event) => {
    let userId = "";
    const { senderEmail, recipientEmail, comment, name } = await parseBody(
        event,
    );
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseServiceRole = serverSupabaseServiceRole<Database>(
        event,
    );
    try {
        const user = await serverSupabaseUser(event);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        console.log("Authenticated user:", user.id);
        userId = user.id;
    } catch (error) {
        console.error("Error retrieving user:", error);
    }

    // 1. Check if user is authenticated
    if (!userId) {
        const { data: anonymousUser, error: authError } = await supabase.auth
            .signInAnonymously();
        if (authError || !anonymousUser) {
            console.error("Authentication error:", authError);
            throw createError({
                status: 401,
                message: "Unauthorized",
            });
        }
        userId = anonymousUser.user!.id;
    }

    const { data: recipientUser, error: recipientError } =
        await supabaseServiceRole
            .from("users").select().eq("email", recipientEmail).single();

    if (recipientError || !recipientUser) {
        console.error("Recipient user retrieval error:", recipientError);
        throw createError({
            status: 404,
            message: "Email du destinataire non trouvé",
        });
    }

    // 1. Check permission
    const { data: establishments, error: establishmentsError } =
        await supabaseServiceRole
            .rpc(
                "check_sender_authorized",
                {
                    sender_email: senderEmail,
                    recipient_email: recipientUser.email,
                },
            );

    if (establishmentsError || !establishments || establishments.length === 0) {
        console.error("Permission check error:", establishmentsError);
        throw createError({
            status: 403,
            message:
                "Vous n'êtes pas autorisé à envoyer des factures pour ce destinataire",
        });
    }

    // 2. Generate and hash code
    const code = generateCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
    const newInvoiceId = crypto.randomUUID();

    const { data: newUploadValidation, error: newUploadValidationError } =
        await supabase
            .from("upload_validations")
            .insert({
                id: newInvoiceId,
                uploader_id: userId,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toISOString(),
                comment: comment || null,
                suppliers: establishments.map((establishments) =>
                    establishments.supplier_id
                ),
                establishments: establishments.map(
                    (establishment) => establishment.establishment_id,
                ),
                recipient_email: recipientEmail,
                file_name: name,
            })
            .select()
            .single();

    if (newUploadValidationError) {
        console.error(
            "Error creating new upload validation:",
            newUploadValidationError,
        );
        throw createError({
            status: 500,
            message:
                "Erreur lors de la création de la nouvelle validation de téléchargement",
        });
    }

    const { emails } = useResend();

    try {
        await emails.send({
            from: `InvoCloud <${process.env.RESEND_EMAIL_FROM}>`,
            to: [senderEmail],
            subject: "Confirmez votre envoie de facture",
            html: `Bonjour,<br><br>` +
                `Pour valider l'envoie de votre facture, veuillez saisir le code suivant dans l'application : <strong>${code}</strong>.<br><br>` +
                `Ce code est valide jusqu'au <strong>${
                    format(expiresAt, "dd/MM/yyyy HH:mm:ss", { locale: fr })
                }</strong>.<br><br>` +
                `Si vous n'avez pas demandé cet envoi, veuillez ignorer ce message.<br><br>` +
                `<p>L'équipe InvoCloud</p>`,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw createError({
            status: 500,
            message: "Erreur lors de l'envoi de l'e-mail de confirmation",
        });
    }

    const response = {
        success: true,
        expires_at: expiresAt.toISOString(),
        upload_validation_id: newUploadValidation.id,
        toJSON() {
            return {
                success: this.success,
                expires_at: this.expires_at,
                upload_validation_id: this.upload_validation_id,
            };
        },
    };
    return response;
});

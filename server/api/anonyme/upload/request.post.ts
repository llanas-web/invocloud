import z from "zod";
import createEstablishmentService from "~~/server/lib/services/establishments.service";
import { serverClient, serverServiceRole } from "~~/server/lib/supabase/client";
import { parseBody } from "~~/server/utils/error-handler";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";
import createUploadRepository from "#shared/repositories/upload.repository";
import { generateCode } from "~/utils/hash";
import { sendEmail } from "~~/server/lib/email";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

const schema = z.object({
    senderEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

export default defineEventHandler(async (event) => {
    const { senderEmail, recipientEmail, comment, name } = await parseBody(
        event,
        schema,
    );

    const supabase = await serverClient(event);
    const supabaseServiceRole = serverServiceRole(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseServiceRole,
    );
    const uploadRepository = createUploadRepository(supabaseServiceRole);

    const establishmentService = createEstablishmentService(
        establishmentRepository,
    );
    const suppliers = await establishmentService.checkEmailPermission(
        senderEmail,
        recipientEmail,
    );
    if (suppliers.length === 0) {
        throw createError({
            status: 401,
            message: "Aucune autorisation d'envoi pour ce destinataire",
        });
    }

    const { data: anonymousUser, error: authError } = await supabase.auth
        .signInAnonymously({
            options: {
                data: {
                    email: senderEmail,
                },
            },
        });
    if (authError || !anonymousUser!.user) {
        console.error("Error signing in anonymously:", authError);
        throw createError({
            status: 500,
            message: "Erreur lors de la création de l'utilisateur anonyme",
        });
    }

    const code = generateCode();
    let invoiceId = crypto.randomUUID();
    const { data: newUploadValidation, error: newUploadValidationError } =
        await uploadRepository.createUploadValidation(
            invoiceId,
            anonymousUser.user.id,
            code,
            suppliers.map((supplier) => supplier.supplier_id),
            suppliers.map((supplier) => supplier.establishment_id),
            recipientEmail,
            name,
            comment,
        );

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

    const emailSend = await sendEmail(
        [senderEmail],
        "Confirmez votre envoie de facture",
        `Bonjour,<br><br>` +
            `Pour valider l'envoie de votre facture, veuillez saisir le code suivant dans l'application : <strong>${code}</strong>.<br><br>` +
            `Ce code est valide jusqu'au <strong>${
                format(
                    newUploadValidation.token_expires_at,
                    "dd/MM/yyyy HH:mm:ss",
                    { locale: fr },
                )
            }</strong>.<br><br>` +
            `Si vous n'avez pas demandé cet envoi, veuillez ignorer ce message.<br><br>` +
            `<p>L'équipe InvoCloud</p>`,
    );
    if (!emailSend) {
        console.error("Error sending email");
        throw createError({
            status: 500,
            message: "Erreur lors de l'envoi de l'e-mail de confirmation",
        });
    }
    return { invoice_id: invoiceId, success: true };
});

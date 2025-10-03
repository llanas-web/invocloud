import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { z } from "zod";
import { generateCode, hashCode } from "~/utils/hash";
import { parseBody } from "~~/server/lib/common";
import {
    serverClient,
    serverServiceRole,
    serverUser,
} from "~~/server/lib/supabase/client";
import type { Establishment } from "~~/types/index";
import type { User } from "@supabase/supabase-js";
import { sendEmail } from "~~/server/lib/email";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

const schema = z.object({
    senderEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

export default defineEventHandler(async (event) => {
    let user: User | null = null;
    let invoiceId = crypto.randomUUID();
    let possibleEstablishments: null | Partial<Establishment>[] = null;
    const { senderEmail, recipientEmail, comment, name } = await parseBody(
        event,
        schema,
    );

    const supabase = await serverClient(event);
    const supabaseServiceRole = serverServiceRole(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseServiceRole,
    );

    // 1. Check permission
    const { data: suppliers, error: suppliersError } = await supabaseServiceRole
        .rpc(
            "check_sender_authorized",
            {
                sender_email: senderEmail,
                recipient_email: recipientEmail,
            },
        );
    console.log("Suppliers data:", suppliers);
    if (suppliersError || !suppliers || suppliers.length === 0) {
        console.error("Permission check error:", suppliersError);
        throw createError({
            status: 403,
            message:
                "Vous n'êtes pas autorisé à envoyer des factures pour ce destinataire",
        });
    }

    try {
        user = await serverUser(event);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        console.log("Authenticated user:", user.id);
    } catch (error) {
        console.error("Error retrieving user:", error);
    }

    // 1. Check if user is authenticated
    if (!user) {
        const { data: anonymousUser, error: authError } = await supabase.auth
            .signInAnonymously({
                options: {
                    data: {
                        email: senderEmail,
                    },
                },
            });
        if (authError || !anonymousUser?.user) {
            console.error("Authentication error:", authError);
            throw createError({
                status: 401,
                message: "Unauthorized",
            });
        }
        user = anonymousUser.user;
    }

    if (user.is_anonymous) {
        const code = generateCode();
        const hashedCode = hashCode(code);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

        const { data: newUploadValidation, error: newUploadValidationError } =
            await supabase
                .from("upload_validations")
                .insert({
                    id: invoiceId,
                    uploader_id: user.id,
                    token_hash: hashedCode,
                    token_expires_at: expiresAt.toISOString(),
                    comment: comment || null,
                    suppliers: suppliers.map((supplier) =>
                        supplier.supplier_id
                    ),
                    establishments: suppliers.map(
                        (supplier) => supplier.establishment_id,
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

        const emailSend = await sendEmail(
            [senderEmail],
            "Confirmez votre envoie de facture",
            `Bonjour,<br><br>` +
                `Pour valider l'envoie de votre facture, veuillez saisir le code suivant dans l'application : <strong>${code}</strong>.<br><br>` +
                `Ce code est valide jusqu'au <strong>${
                    format(expiresAt, "dd/MM/yyyy HH:mm:ss", { locale: fr })
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
    } else {
        const listEstablishmentIds = suppliers.map(
            (supplier) => supplier.establishment_id,
        );
        const { data: establishmentsData, error: establishmentsError } =
            await establishmentRepository.getEstablishmentsByIds(
                listEstablishmentIds,
            );
        console.log("Establishments data:", establishmentsData);

        if (establishmentsError) {
            console.error(
                "Error fetching establishments:",
                establishmentsError,
            );
            throw createError({
                status: 500,
                message: "Erreur lors de la récupération des établissements",
            });
        }

        possibleEstablishments = establishmentsData.map((establishment) => ({
            id: establishment.id,
            name: establishment.name,
        }));
    }

    const response = {
        success: true,
        invoice_id: invoiceId,
        establishements: possibleEstablishments,
        toJSON() {
            return {
                success: this.success,
                invoice_id: this.invoice_id,
                establishements: this.establishements,
            };
        },
    };
    return response;
});

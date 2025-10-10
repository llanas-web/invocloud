import { z } from "zod";
import createEstablishmentService from "~~/server/lib/services/establishments.service";
import { serverServiceRole } from "~~/server/lib/supabase/client";
import createEstablishmentRepository from "~~/shared/providers/database/supabase/repositories/establishment.repository";

const schema = z.object({
    senderEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

export default defineEventHandler(async (event) => {
    const { senderEmail, recipientEmail } = await parseBody(
        event,
        schema,
    );

    const supabaseServiceRole = serverServiceRole(event);
    const establishmentsRepository = createEstablishmentRepository(
        supabaseServiceRole,
    );
    const establishmentService = createEstablishmentService(
        establishmentsRepository,
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
    const { data: establishments, error: establishmentsError } =
        await establishmentsRepository
            .getEstablishmentsByIds(
                suppliers.map(({ establishment_id }) => establishment_id),
            );
    if (establishmentsError) {
        console.error("Error fetching establishments:", establishmentsError);
        throw createError({
            status: 500,
            message: "Erreur lors de la récupération des établissements",
        });
    }
    return {
        message: "Permission granted to send the file.",
        establishments: establishments.map(({ id, name }) => ({
            id,
            name,
        })),
    };
});

import createEstablishmentRepository from "#shared/repositories/establishment.repository";
import { serverClient, serverServiceRole } from "../supabase/client";
import type { EventHandlerRequest, H3Event } from "h3";

const createEstablishmentService = (
    establishmentRepository: ReturnType<typeof createEstablishmentRepository>,
) => {
    const checkEmailPermission = async (
        senderEmail: string,
        recipientEmail: string,
    ) => {
        const { data: suppliers, error: suppliersError } =
            await establishmentRepository.getSuppliersFromEmailSender(
                senderEmail,
                recipientEmail,
            );
        if (suppliersError) {
            console.error("Error checking email permission:", suppliersError);
            throw createError({
                status: 500,
                message: "Erreur lors de la vérification des autorisations",
            });
        }
        return suppliers;
    };

    return {
        checkEmailPermission,
    };
};

export default createEstablishmentService;

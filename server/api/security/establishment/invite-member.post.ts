import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { DomainError, DomainErrorCode } from "~~/shared/errors/domain.error";

const schema = z.object({
    email: z.email(),
    establishmentId: z.uuid(),
    invitorId: z.uuid(),
});

export default defineEventHandler(async (event) => {
    try {
        const {
            deps: {
                email: emailRepository,
                auth,
                database: { establishmentRepository, userRepository },
            },
        } = await buildRequestScope(
            event,
        );

        const { email, establishmentId, invitorId } = await parseBody(
            event,
            schema,
        );

        // Get establishment to check existence
        const establishments = await establishmentRepository
            .getAllEstablishments({
                ids: [establishmentId],
            });
        if (establishments.length === 0) {
            throw createError({ status: HTTPStatus.BAD_REQUEST });
        }

        try {
            // Get existing user by email
            const existingUser = await userRepository.getUser({ email: email });
            const establishment = establishments[0];
            await establishmentRepository
                .addEstablishmentMember(
                    establishmentId,
                    existingUser.id,
                );
            await emailRepository.sendEmail({
                to: [email],
                subject: "Vous avez été ajouté à un établissement",
                html:
                    `Bonjour ${
                        existingUser.fullName || existingUser.email
                    },<br><br>` +
                    `Vous avez été ajouté à l'établissement <strong>${establishment.name}</strong>.<br><br>`,
            });
        } catch (error) {
            // If user not found, invite user
            if (
                error instanceof DomainError &&
                error.code === DomainErrorCode.UESR_NOT_FOUND
            ) {
                const config = useRuntimeConfig();
                await auth.inviteUser(email, {
                    establishmentId,
                    invitorId,
                    redirection: `${config.public.baseUrl}/auth/callback`,
                });
            } else {
                throw error;
            }
        }

        const result = await establishmentRepository.addEstablishmentMember(
            email,
            establishmentId,
        );
        return result;
    } catch (error) {
        console.error("Unexpected error:", error);
        throw createError({
            status: 500,
            message: "Erreur interne du serveur",
        });
    }
});

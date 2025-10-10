import ServerError from "../core/errors";
import { HTTPStatus } from "../core/errors/status";
import { Deps } from "../core/types";
import { sendEmail } from "../lib/providers/email";

const useInviteMemberService = (deps: Deps) => {
    const {
        establishmentRepository,
        userRepository,
        authRepository,
        adminRepository,
    } = deps.repos;

    const checkInvitorAuthorization = async (
        invitorId: string,
        establishmentId: string,
    ) => {
        // Check if the invitor is the creator of the establishment
        const establishments = await establishmentRepository
            .getAllEstablishments({
                ids: [establishmentId],
            });
        if (establishments.length === 0) {
            throw new ServerError(
                HTTPStatus.NOT_FOUND,
                "Établissement non trouvé",
            );
        }
        const establishment = establishments[0];
        if (establishment.creatorId !== invitorId) {
            throw new ServerError(
                HTTPStatus.FORBIDDEN,
                "L'utilisateur est déjà membre de cet établissement",
            );
        }
        return true;
    };

    const inviteMember = async (
        email: string,
        establishmentId: string,
        invitorId: string,
    ) => {
        const config = useRuntimeConfig();
        const redirectTo = `${config.public.baseUrl}/auth/callback`;
        // Check if the user already exists
        const user = await userRepository
            .getUser({ email });
        if (!user) {
            await adminRepository.inviteUserByEmail(email, {
                establishmentId,
                invitorId,
            }, redirectTo);
        } else {
            const establishments = await establishmentRepository
                .getAllEstablishments({
                    ids: [establishmentId],
                });
            if (establishments.length === 0) {
                throw new ServerError(
                    HTTPStatus.NOT_FOUND,
                    "Établissement non trouvé",
                );
            }
            const establishment = establishments[0];
            await establishmentRepository
                .addEstablishmentMember(establishmentId, user.id);
            const emailSend = await sendEmail(
                [email],
                "Vous avez été ajouté à un établissement",
                `Bonjour ${user.fullName || user.email},<br><br>` +
                    `Vous avez été ajouté à l'établissement <strong>${establishment.name}</strong>.<br><br>`,
            );
            if (!emailSend) {
                console.error(
                    "Error sending notification email to existing user",
                );
            }
        }
    };

    return {
        checkInvitorAuthorization,
        inviteMember,
    };
};

export default useInviteMemberService;

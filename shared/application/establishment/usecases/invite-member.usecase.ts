import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { ApplicationError } from "../../common/errors/application.error";
import {
    type InviteMemberCommand,
    InviteMemberCommandSchema,
} from "../commands";
import type { UserRepository } from "~~/shared/domain/user/user.repository";
import type { EmailRepository } from "../../common/providers/email/email.repository";
import type { AuthRepository } from "../../common/providers/auth/auth.repository";
import type { UserQuery } from "../../user/user.query";

export class InviteMemberUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
        private readonly userQuery: UserQuery,
        private readonly emailRepository: EmailRepository,
        private readonly authRepository: AuthRepository,
    ) {}

    async execute(raw: InviteMemberCommand): Promise<void> {
        const parsed = InviteMemberCommandSchema.parse(raw);
        const establishment = await this.establishmentRepo.getById(
            parsed.establishmentId,
        );
        const authenticatedUser = this.authRepository.connectedUser;

        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }

        if (!establishment.hasMember(authenticatedUser!.id)) {
            throw new ApplicationError(
                "Vous n'avez pas les droits pour inviter un membre",
            );
        }

        let userId: string;
        const users = await this.userQuery.listUsers({
            emails: [parsed.email],
        });
        if (users.length === 0) {
            userId = await this.authRepository.inviteUser(
                parsed.email,
                {
                    establishmentId: parsed.establishmentId,
                    invitorId: authenticatedUser!.id,
                    redirection: "/setup-account",
                },
            );
        } else {
            userId = users[0]!.id;
        }
        const updatedEstablishment = establishment.inviteMember(userId);

        await this.establishmentRepo.update(
            updatedEstablishment,
        );

        await this.emailRepository.sendEmail({
            to: [parsed.email],
            subject: "Invitation à rejoindre un établissement",
            html: `Vous avez été invité à rejoindre ${establishment.name}`,
        });
    }
}

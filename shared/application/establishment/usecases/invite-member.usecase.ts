import { ApplicationError } from "../../common/errors/application.error";
import type { EmailRepository } from "../../common/providers/email/email.repository";
import type { AuthRepository } from "../../common/providers/auth/auth.repository";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import { MemberRole } from "~~/shared/domain/establishment/member.entity";
import type { AdminRepository } from "../../common/providers/auth/admin.repository";

export const InviteMemberCommandSchema = z.object({
    establishmentId: z.uuid(),
    email: z.email().max(255),
    role: z.enum(MemberRole).default(MemberRole.ADMIN),
});
export type InviteMemberCommand = z.input<
    typeof InviteMemberCommandSchema
>;

export default class InviteMemberUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly emailRepository: EmailRepository,
        private readonly authRepository: AuthRepository,
        private readonly adminRepository: AdminRepository,
    ) {}

    async execute(command: InviteMemberCommand): Promise<void> {
        const parsed = InviteMemberCommandSchema.parse(command);
        const establishment = await this.repos.establishmentsRepo.getById(
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
        const users = await this.queries.userQuery.listUsers({
            emails: [parsed.email],
        });
        if (users.length === 0) {
            userId = await this.adminRepository.inviteUser(
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

        await this.repos.establishmentsRepo.update(
            updatedEstablishment,
        );

        await this.emailRepository.sendEmail({
            to: [parsed.email],
            subject: "Invitation à rejoindre un établissement",
            html: `Vous avez été invité à rejoindre ${establishment.name}`,
        });
    }
}

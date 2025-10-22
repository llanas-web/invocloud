import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export type InviteMemberInput = {
    establishmentId: string;
    email: string;
    invitorId: string;
};

export class InviteMemberUsecase {
    constructor(
        private establishmentRepo: EstablishmentRepository,
        // private userRepo: UserRepository,
        // private emailService: EmailInterface,
    ) {}

    async execute(input: InviteMemberInput): Promise<void> {
        // 1. Charger l'établissement (aggregate root)
        const establishment = await this.establishmentRepo.getById(
            input.establishmentId,
        );

        if (!establishment) {
            throw new Error("Établissement non trouvé");
        }

        // 2. Vérifier que l'inviteur est bien membre
        if (!establishment.hasMember(input.invitorId)) {
            throw new Error(
                "Vous n'avez pas les droits pour inviter un membre",
            );
        }

        // 3. Récupérer ou créer l'utilisateur
        // let user = await this.userRepo.getUser({ email: input.email });

        // 4. Inviter le membre (logique métier dans l'aggregate)
        // const updatedEstablishment = establishment.inviteMember(user.id, user);

        // 5. Persister les changements
        // await this.establishmentRepo.update(
        //     updatedEstablishment,
        // );

        // // 6. Envoyer l'email d'invitation
        // await this.emailService.sendEmail({
        //     to: [input.email],
        //     subject: "Invitation à rejoindre un établissement",
        //     html: `Vous avez été invité à rejoindre ${establishment.name}`,
        // });
    }
}

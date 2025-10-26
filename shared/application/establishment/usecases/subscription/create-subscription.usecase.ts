import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { EmailRepository } from "~~/shared/application/common/providers/email/email.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import SubscriptionEntity from "~~/shared/domain/establishment/subscription.entity";
import type { UserRepository } from "~~/shared/domain/user/user.repository";

export const CreateSubscriptionCommandSchema = z.object({
    userId: z.uuid(),
    establishmentId: z.uuid(),
    paymentProvider: z.enum(["stripe"]),
    trialEndDate: z.date(),
    subscriptionId: z.string(),
    customerId: z.string(),
});

export class CreateSubscriptionUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
        private readonly userRepository: UserRepository,
        private readonly emailRepository: EmailRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const {
            establishmentId,
            trialEndDate,
            subscriptionId,
            customerId,
            userId,
        } = CreateSubscriptionCommandSchema.parse(raw);
        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        const updatedEstablishment = establishment.withSubscription(
            SubscriptionEntity.createTrial(
                trialEndDate,
                subscriptionId,
                customerId,
            ),
        );
        await this.establishmentRepo.update(updatedEstablishment);

        const user = await this.userRepository.getById(userId);

        if (!user) {
            throw new ApplicationError("User not found");
        }
        await this.emailRepository.sendEmail({
            to: [user.email],
            subject: "Confirmation abonnement Invocloud",
            html: `Bonjour,<br><br>` +
                `<p>Merci pour votre abonnement à Invocloud ! Votre essai gratuit de 7 jours a commencé. Vous pouvez dès à présent profiter de toutes les fonctionnalités premium.</p>` +
                `<p>Votre abonnement commencera le ${
                    format(
                        trialEndDate,
                        "dd/MM/yyyy",
                        {
                            locale: fr,
                        },
                    )
                }</p><br><br>` +
                `<p>Si vous avez des questions, n'hésitez pas à nous contacter: <a href="mailto:contact@invocloud.fr">contact@invocloud.fr</a></p><br>` +
                `<p>L'équipe InvoCloud</p>`,
        });
    }
}

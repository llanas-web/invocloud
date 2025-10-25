import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import SubscriptionEntity from "~~/shared/domain/establishment/subscription.entity";

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
    ) {}

    async execute(raw: unknown): Promise<void> {
        const {
            establishmentId,
            trialEndDate,
            subscriptionId,
            customerId,
        } = CreateSubscriptionCommandSchema.parse(raw);
        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        establishment.withSubscription(
            SubscriptionEntity.createTrial(
                trialEndDate,
                subscriptionId,
                customerId,
            ),
        );
        await this.establishmentRepo.update(establishment);

        // TODO: Send confirmation email
        // const { email } = await userRepository.getUser({
        //     id: session.customer_email!,
        // });

        // await emailRepository.sendEmail({
        //     to: [email],
        //     subject: "Confirmation abonnement Invocloud",
        //     html: `Bonjour,<br><br>` +
        //         `<p>Merci pour votre abonnement à Invocloud ! Votre essai gratuit de 7 jours a commencé. Vous pouvez dès à présent profiter de toutes les fonctionnalités premium.</p>` +
        //         `<p>Votre abonnement commencera le ${
        //             format(
        //                 fromUnix(subscription.trial_end)!,
        //                 "dd/MM/yyyy",
        //                 {
        //                     locale: fr,
        //                 },
        //             )
        //         }</p><br><br>` +
        //         `<p>Si vous avez des questions, n'hésitez pas à nous contacter: <a href="mailto:contact@invocloud.fr">contact@invocloud.fr</a></p><br>` +
        //         `<p>L'équipe InvoCloud</p>`,
        // });
    }
}

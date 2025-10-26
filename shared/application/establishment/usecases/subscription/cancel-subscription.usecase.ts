import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export class CancelSubscriptionUsecase {
    constructor(
        private establishmentRepository: EstablishmentRepository,
        private paymentRepositoryFactory: PaymentRepository,
    ) {}

    async execute(establishmentId: string): Promise<void> {
        const establishment = await this.establishmentRepository.getById(
            establishmentId,
        );
        if (!establishment || !establishment.hasActiveSubscription()) {
            throw new ApplicationError(
                "Establishment or subscription not found",
            );
        }
        let updatedEstablishment;
        if (establishment.subscription?.isTrialing) {
            await this.paymentRepositoryFactory.cancelTrialingPeriod(
                establishment.subscription.providerSubscriptionId!,
            );
            updatedEstablishment = establishment.cancelSubscription(new Date());
        } else {
            const cancelAt = await this.paymentRepositoryFactory
                .cancelSubscription(
                    establishment.subscription!.providerSubscriptionId!,
                );
            updatedEstablishment = establishment.cancelSubscription(
                new Date(cancelAt),
            );
        }
        await this.establishmentRepository.update(updatedEstablishment);
    }
}

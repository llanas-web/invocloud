import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const CancelSubscriptionCommandSchema = z.object({
    establishmentId: z.uuid(),
});
export type CancelSubscriptionCommand = z.input<
    typeof CancelSubscriptionCommandSchema
>;

export default class CancelSubscriptionUsecase {
    constructor(
        private repos: Repositories,
        private queries: Queries,
        private paymentRepository: PaymentRepository,
    ) {}

    async execute(command: CancelSubscriptionCommand): Promise<void> {
        const parsed = CancelSubscriptionCommandSchema.parse(
            command,
        );
        const { establishmentId } = parsed;
        const establishment = await this.repos.establishmentsRepo.getById(
            establishmentId,
        );
        if (!establishment || !establishment.hasActiveSubscription()) {
            throw new ApplicationError(
                "Establishment or subscription not found",
            );
        }
        let updatedEstablishment;
        if (establishment.subscription?.isTrialing) {
            await this.paymentRepository.cancelTrialingPeriod(
                establishment.subscription.providerSubscriptionId!,
            );
            updatedEstablishment = establishment.cancelSubscription(new Date());
        } else {
            const cancelAt = await this.paymentRepository.cancelSubscription(
                establishment.subscription!.providerSubscriptionId!,
            );
            updatedEstablishment = establishment.cancelSubscription(
                new Date(cancelAt),
            );
        }
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }
}

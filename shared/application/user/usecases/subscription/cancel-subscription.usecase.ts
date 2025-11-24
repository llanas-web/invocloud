import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const CancelSubscriptionCommandSchema = z.object({
    userId: z.uuid(),
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
        const { userId } = parsed;
        const user = await this.repos.userRepo.getById(
            userId,
        );
        if (!user || !user.hasActiveSubscription()) {
            throw new ApplicationError(
                "User or subscription not found",
            );
        }
        const cancelAt = await this.paymentRepository.cancelSubscription(
            user.subscription!.providerSubscriptionId!,
        );
        const updatedUser = user.cancelSubscription(
            new Date(cancelAt),
        );
        await this.repos.userRepo.update(updatedUser);
    }
}

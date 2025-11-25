import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const ActivateSubscriptionCommandSchema = z.object({
    userId: z.uuid(),
    subscriptionPlanId: z.uuid(),
});
export type ActivateSubscriptionCommand = z.input<
    typeof ActivateSubscriptionCommandSchema
>;

export default class ActivateSubscriptionUsecase {
    constructor(
        private repos: Repositories,
        private queries: Queries,
        private paymentRepository: PaymentRepository,
    ) {}

    async execute(command: ActivateSubscriptionCommand): Promise<void> {
        const parsed = ActivateSubscriptionCommandSchema.parse(
            command,
        );
        const { userId, subscriptionPlanId } = parsed;
        const user = await this.repos.userRepo.getById(
            userId,
        );

        if (!user) throw new ApplicationError("User not found");
        if (user.subscription === null) {
            throw new ApplicationError(
                "User does not have an active subscription to activate",
            );
        }

        let updatedUser;
        if (user.subscription.planId === subscriptionPlanId) {
            // update subscription to active
            await this.paymentRepository.activateSubscription(
                user.subscription.providerSubscriptionId!,
            );
            updatedUser = user.reactivateSubscription();
        } else {
            // update subscription to new plan
            const subscriptionPlan = await this.queries.subscriptionPlanQuery
                .getById(
                    subscriptionPlanId,
                );
            await this.paymentRepository.updateSubscriptionPlan(
                user.subscription.providerSubscriptionId!,
                subscriptionPlan!,
            );
            updatedUser = user.updateSubscription(
                (subscription) =>
                    subscription.updateSubscriptionPlan(subscriptionPlanId),
            );
        }
        await this.repos.userRepo.update(updatedUser);
    }
}

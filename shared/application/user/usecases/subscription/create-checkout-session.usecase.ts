import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "../../../common/errors/application.error";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import type { AuthUserModel } from "~~/shared/application/common/providers/auth/dto/auth.dto";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const CreateCheckoutSessionCommandSchema = z.object({
    userId: z.uuid(),
    plan: z.enum(["starter", "pro"]),
});
export type CreateCheckoutSessionCommand = z.input<
    typeof CreateCheckoutSessionCommandSchema
>;

export default class CreateCheckoutSessionUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly authRepo: AuthRepository,
        private readonly paymentRepo: PaymentRepository,
    ) {}

    async execute(command: CreateCheckoutSessionCommand): Promise<string> {
        const parsed = CreateCheckoutSessionCommandSchema
            .parse(command);
        const { userId, plan } = parsed;
        const authenticatedUser = this.authRepo.connectedUser as AuthUserModel;
        if (!authenticatedUser || authenticatedUser.isAnonymous) {
            throw new ApplicationError("User not authenticated");
        }
        const user = await this.repos.userRepo.getById(
            userId,
        );
        if (!user) {
            throw new ApplicationError("User not found");
        }
        const subscriptionPlan = await this.queries.subscriptionPlanQuery
            .getSubscriptionPlanByName(
                plan,
            );
        if (!subscriptionPlan) {
            throw new ApplicationError("Subscription plan not found");
        }
        const checkoutSessionUrl = await this.paymentRepo.createCheckoutSession(
            {
                userId: authenticatedUser.id,
                email: authenticatedUser.email,
                subscriptionPlan,
                customerId: user.subscription?.providerCustomerId ??
                    undefined,
            },
        );
        if (!checkoutSessionUrl) {
            throw new ApplicationError("Failed to create checkout session");
        }
        return checkoutSessionUrl;
    }
}

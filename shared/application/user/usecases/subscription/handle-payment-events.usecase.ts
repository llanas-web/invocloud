import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type {
    CheckoutSessionCreatedDto,
    InvoicePaymentSucceededDto,
    SubscriptionUpdatedDto,
} from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";
import SubscriptionEntity, {
    SubscriptionStatus,
} from "~~/shared/domain/user/subscription.entity";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { UserModel } from "~~/shared/domain/user/user.model";

export default class HandlePaymentEventsUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    private async getUserBySubscriptionId(
        subscriptionId: string,
    ): Promise<UserModel> {
        const userId = await this.queries.userQuery
            .getUserIdByProviderSubscriptionId(
                subscriptionId,
            );
        if (!userId) {
            throw new ApplicationError(
                "Utilisateur non trouvé pour la souscription donnée",
            );
        }
        const user = await this.repos.userRepo.getById(
            userId,
        );
        if (!user) {
            throw new ApplicationError("Utilisateur non trouvé");
        }
        return user;
    }

    async handleCheckoutSucceeded(
        dto: CheckoutSessionCreatedDto,
    ): Promise<void> {
        const user = await this.repos.userRepo.getById(
            dto.userId,
        );
        if (!user) {
            throw new ApplicationError("Utilisateur non trouvé");
        }
        let updatedUser: UserModel;
        if (user.subscription !== null) {
            console.log("Checkout for existing subscription");
        } else {
            updatedUser = user.withSubscription(
                SubscriptionEntity.createActive({
                    endDate: dto.trialEndDate,
                    planId: dto.subscriptionPlanId,
                    providerSubscriptionId: dto.subscriptionId,
                    providerCustomerId: dto.customerId,
                }),
            );
            await this.repos.userRepo.update(updatedUser);
        }
    }

    async handleInvoicePaymentSucceeded(
        dto: InvoicePaymentSucceededDto,
    ): Promise<void> {
        const user = await this.getUserBySubscriptionId(
            dto.subscriptionId,
        );
        const updatedUser = user.renewSubscription(
            dto.periodEndAt,
        );
        await this.repos.userRepo.update(updatedUser);
    }

    async handleSubscriptionDeleted(subscriptionId: string): Promise<void> {
        const user = await this.getUserBySubscriptionId(
            subscriptionId,
        );
        const updatedUser = user.removeSubscription();
        await this.repos.userRepo.update(updatedUser);
    }

    async handleSubscriptionUpdated(
        dto: SubscriptionUpdatedDto,
    ): Promise<void> {
        const user = await this.getUserBySubscriptionId(
            dto.subscriptionId,
        );
        const updatedUser = user.updateSubscription((sub) =>
            sub.updateStatus(dto.status)
        );
        await this.repos.userRepo.update(updatedUser);
    }

    async handlePaymentFailed(subscriptionId: string): Promise<void> {
        const user = await this.getUserBySubscriptionId(
            subscriptionId,
        );
        const updatedUser = user.updateSubscription((sub) =>
            sub.updateStatus(
                SubscriptionStatus.PAST_DUE,
            )
        );
        await this.repos.userRepo.update(updatedUser);
    }
}

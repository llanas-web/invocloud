import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type {
    CheckoutSessionCreatedDto,
    InvoicePaymentSucceededDto,
    PaymentFailedDto,
    SubscriptionDeletedDto,
    SubscriptionUpdatedDto,
} from "~~/shared/application/common/providers/payment/dtos/payment-event.dto";
import SubscriptionEntity, {
    SubscriptionStatus,
} from "~~/shared/domain/establishment/subscription.entity";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export default class HandlePaymentEventsUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async handleTrialSucceeded(
        dto: CheckoutSessionCreatedDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        const updatedEstablishment = establishment.withSubscription(
            SubscriptionEntity.createTrial(
                dto.trialEndDate,
                dto.subscriptionId,
                dto.customerId,
            ),
        );
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }

    async handleInvoicePaymentSucceeded(
        dto: InvoicePaymentSucceededDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }

        const updatedEstablishment = establishment.renewSubscription(
            dto.periodEnd,
        );
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }

    async handleSubscriptionUpdated(
        dto: SubscriptionUpdatedDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }

        if (dto.status === "active") {
            const updatedEstablishment = establishment.activateSubscription(
                dto.currentPeriodEnd,
            );
            await this.repos.establishmentsRepo.update(updatedEstablishment);
        }
    }

    async handleSubscriptionDeleted(
        dto: SubscriptionDeletedDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        const updatedEstablishment = establishment.cancelSubscription(
            dto.endedAt,
        );
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }

    async handlePaymentFailed(
        dto: PaymentFailedDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        const updatedEstablishment = establishment.updateSubscription((sub) =>
            sub.updateStatus(
                SubscriptionStatus.PAST_DUE,
            )
        );
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }
}

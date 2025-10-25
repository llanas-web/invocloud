import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
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

export class HandlePaymentEventsUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
    ) {}

    async handleTrialSucceeded(
        dto: CheckoutSessionCreatedDto,
    ): Promise<void> {
        const establishment = await this.establishmentRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        establishment.withSubscription(
            SubscriptionEntity.createTrial(
                dto.trialEndDate,
                dto.subscriptionId,
                dto.customerId,
            ),
        );
        await this.establishmentRepo.update(establishment);
    }

    async handleInvoicePaymentSucceeded(
        dto: InvoicePaymentSucceededDto,
    ): Promise<void> {
        const establishment = await this.establishmentRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }

        establishment.renewSubscription(dto.periodEnd);
        await this.establishmentRepo.update(establishment);
    }

    async handleSubscriptionUpdated(
        dto: SubscriptionUpdatedDto,
    ): Promise<void> {
        const establishment = await this.establishmentRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }

        if (dto.status === "active") {
            establishment.activateSubscription(dto.currentPeriodEnd);
        }

        await this.establishmentRepo.update(establishment);
    }

    async handleSubscriptionDeleted(
        dto: SubscriptionDeletedDto,
    ): Promise<void> {
        const establishment = await this.establishmentRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        establishment.cancelSubscription(dto.endedAt);
        await this.establishmentRepo.update(establishment);
    }

    async handlePaymentFailed(
        dto: PaymentFailedDto,
    ): Promise<void> {
        const establishment = await this.establishmentRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        establishment.updateSubscription((sub) =>
            sub.updateStatus(
                SubscriptionStatus.PAST_DUE,
            )
        );
        await this.establishmentRepo.update(establishment);
    }
}

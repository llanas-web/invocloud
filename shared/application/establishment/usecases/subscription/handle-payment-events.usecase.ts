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
import type { EstablishmentModel } from "~~/shared/domain/establishment/establishment.model";

export default class HandlePaymentEventsUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    private async getEstablishmentBySubscriptionId(
        subscriptionId: string,
    ): Promise<EstablishmentModel> {
        const establishmentId = await this.queries.establishmentQuery
            .getEstablishmentIdByProviderSubscriptionId(
                subscriptionId,
            );
        if (!establishmentId) {
            throw new ApplicationError(
                "Établissement non trouvé pour la souscription donnée",
            );
        }
        const establishment = await this.repos.establishmentsRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        return establishment;
    }

    async handleCheckoutSucceeded(
        dto: CheckoutSessionCreatedDto,
    ): Promise<void> {
        const establishment = await this.repos.establishmentsRepo.getById(
            dto.establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Établissement non trouvé");
        }
        let updatedEstablishment: EstablishmentModel;
        if (establishment.subscription !== null) {
            console.log("Checkout for existing subscription");
        } else {
            updatedEstablishment = establishment.withSubscription(
                SubscriptionEntity.createTrial(
                    dto.trialEndDate,
                    dto.subscriptionId,
                    dto.customerId,
                ),
            );
            await this.repos.establishmentsRepo.update(updatedEstablishment);
        }
    }

    async handleInvoicePaymentSucceeded(
        dto: InvoicePaymentSucceededDto,
    ): Promise<void> {
        const establishment = await this.getEstablishmentBySubscriptionId(
            dto.subscriptionId,
        );
        const updatedEstablishment = establishment.renewSubscription();
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }

    async handleSubscriptionUpdated(
        dto: SubscriptionUpdatedDto,
    ): Promise<void> {
        const establishment = await this.getEstablishmentBySubscriptionId(
            dto.subscriptionId,
        );

        if (dto.status === SubscriptionStatus.ACTIVE) {
            const updatedEstablishment = establishment.activateSubscription(
                dto.currentPeriodEnd,
            );
            await this.repos.establishmentsRepo.update(updatedEstablishment);
        }
    }

    async handleSubscriptionDeleted(subscriptionId: string): Promise<void> {
        const establishment = await this.getEstablishmentBySubscriptionId(
            subscriptionId,
        );
        const updatedEstablishment = establishment.removeSubscription();
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }

    async handlePaymentFailed(subscriptionId: string): Promise<void> {
        const establishment = await this.getEstablishmentBySubscriptionId(
            subscriptionId,
        );
        const updatedEstablishment = establishment.updateSubscription((sub) =>
            sub.updateStatus(
                SubscriptionStatus.PAST_DUE,
            )
        );
        await this.repos.establishmentsRepo.update(updatedEstablishment);
    }
}

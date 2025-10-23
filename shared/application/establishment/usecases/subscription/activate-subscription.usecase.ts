import { z } from "zod";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export const UpdateSubscriptionCommandSchema = z.object({
    establishmentId: z.uuid(),
    currentPeriodEnd: z.date(),
    currentPeriodStart: z.date().optional(),
});

export class ActivateSubscriptionUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const {
            establishmentId,
            currentPeriodEnd,
            currentPeriodStart,
        } = UpdateSubscriptionCommandSchema.parse(raw);

        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment || !establishment.hasActiveSubscription()) {
            throw new ApplicationError(
                "Establishment or subscription not found",
            );
        }
        establishment.activateSubscription(
            currentPeriodEnd,
            currentPeriodStart,
        );
        await this.establishmentRepo.update(establishment);
    }
}

import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "../../../common/errors/application.error";
import type { UserModel } from "~~/shared/types/models/user.model";

export class CreateSubscriptionUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
        private readonly paymentRepo: PaymentRepository,
    ) {}

    async execute(
        establishmentId: string,
        customer: UserModel,
    ): Promise<string> {
        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        const paymentSession = await this.paymentRepo.createSubscription(
            customer.email,
            establishmentId,
        );
        await this.establishmentRepo.update(establishmentId, establishment);
        return paymentSession;
    }
}

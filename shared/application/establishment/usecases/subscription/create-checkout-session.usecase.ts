import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "../../../common/errors/application.error";
import { CreateCheckoutSessionCommandSchema } from "../../commands";

export class CreateCheckoutSessionUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
        private readonly paymentRepo: PaymentRepository,
    ) {}

    async execute(raw: unknown): Promise<string> {
        const { userId, establishmentId } = CreateCheckoutSessionCommandSchema
            .parse(raw);
        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        const checkoutSessionUrl = await this.paymentRepo.createCheckoutSession(
            userId,
            establishmentId,
        );
        return checkoutSessionUrl;
    }
}

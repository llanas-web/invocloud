import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "../../../common/errors/application.error";
import { CreateCheckoutSessionCommandSchema } from "../../commands";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import type { AuthUserModel } from "~~/shared/application/common/providers/auth/dto/auth.dto";

export class CreateCheckoutSessionUsecase {
    constructor(
        private readonly establishmentRepo: EstablishmentRepository,
        private readonly authRepo: AuthRepository,
        private readonly paymentRepo: PaymentRepository,
    ) {}

    async execute(raw: unknown): Promise<string> {
        const { establishmentId } = CreateCheckoutSessionCommandSchema
            .parse(raw);
        const authenticatedUser = this.authRepo.connectedUser as AuthUserModel;
        if (!authenticatedUser || authenticatedUser.isAnonymous) {
            throw new ApplicationError("User not authenticated");
        }
        const establishment = await this.establishmentRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        const checkoutSessionUrl = await this.paymentRepo.createCheckoutSession(
            authenticatedUser.id,
            authenticatedUser.email,
            establishmentId,
        );
        return checkoutSessionUrl;
    }
}

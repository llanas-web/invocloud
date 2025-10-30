import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { ApplicationError } from "../../../common/errors/application.error";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import type { AuthUserModel } from "~~/shared/application/common/providers/auth/dto/auth.dto";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const CreateCheckoutSessionCommandSchema = z.object({
    establishmentId: z.uuid(),
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
        const { establishmentId } = parsed;
        const authenticatedUser = this.authRepo.connectedUser as AuthUserModel;
        if (!authenticatedUser || authenticatedUser.isAnonymous) {
            throw new ApplicationError("User not authenticated");
        }
        const establishment = await this.repos.establishmentsRepo.getById(
            establishmentId,
        );
        if (!establishment) {
            throw new ApplicationError("Establishment not found");
        }
        const checkoutSessionUrl = await this.paymentRepo.createCheckoutSession(
            {
                userId: authenticatedUser.id,
                email: authenticatedUser.email,
                establishmentId: establishmentId,
                customerId: establishment.subscription?.providerCustomerId ??
                    undefined,
            },
        );
        return checkoutSessionUrl;
    }
}

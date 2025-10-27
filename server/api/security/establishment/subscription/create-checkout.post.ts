import { useServerDi } from "~~/server/middleware/injection.middleware";
import { CreateCheckoutSessionBodySchema } from "~~/shared/contracts/api/security/establishments/subscription/create-checkout.contract";
import CreateCheckoutSessionUsecase from "~~/shared/application/establishment/usecases/subscription/create-checkout-session.usecase";

export default defineEventHandler(async (event) => {
    const { repos, queries, authRepository, paymentRepository } = useServerDi(
        event,
    );

    const { establishmentId } = await parseBody(
        event,
        CreateCheckoutSessionBodySchema,
    );

    const createCheckoutSessionUsecase = new CreateCheckoutSessionUsecase(
        repos,
        queries,
        authRepository,
        paymentRepository,
    );
    const checkoutUrl = await createCheckoutSessionUsecase
        .execute({ establishmentId });
    return checkoutUrl;
});

import {
    createError,
    defineEventHandler,
    getRequestHeaders,
    readRawBody,
} from "h3";
import Stripe from "stripe";
import { handleError } from "~~/server/core/errors/handling-error";
import ServerError from "~~/server/core/errors/server.error";
import { HTTPStatus } from "~~/server/core/errors/status";
import { StripeEventAdapter } from "~~/server/infra/stripe/adapters/stripe-event.adapter";
import PaymentStripeRepository from "~~/server/infra/stripe/payment.stripe.repository";
import {
    fromInvoiceToSubscription,
    fromSessionToSubscription,
} from "~~/server/infra/stripe/utils/mapper";
import { useServerDi } from "~~/server/middleware/injection.middleware";
import HandlePaymentEventsUsecase from "~~/shared/application/establishment/usecases/subscription/handle-payment-events.usecase";

export default defineEventHandler(async (event) => {
    try {
        const sig = getRequestHeaders(event)["stripe-signature"] as string;
        const rawBody = await readRawBody(event);
        const { repos, queries } = useServerDi(event);

        const { stripeWebhookSecret } = useRuntimeConfig();
        if (!sig || !rawBody) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    "Signature Stripe manquante ou corps de requête vide",
            });
        }

        const stripeRepository = new PaymentStripeRepository();
        const stripeEvent = stripeRepository.stripeInstance.webhooks
            .constructEvent(
                rawBody,
                sig,
                stripeWebhookSecret,
            );
        const eventData = stripeEvent.data.object;
        console.log("eventData: ", eventData);

        const handlePaymentEventsUsecase = new HandlePaymentEventsUsecase(
            repos,
            queries,
        );

        switch (stripeEvent.type) {
            case "checkout.session.completed": {
                const session = eventData as Stripe.Checkout.Session;
                const subscriptionId = fromSessionToSubscription(session);
                if (!subscriptionId) {
                    throw new ServerError(
                        HTTPStatus.BAD_REQUEST,
                        "No subscription ID found in checkout session",
                    );
                }
                const subscription = await stripeRepository
                    .retreiveSubscription(
                        subscriptionId,
                    );
                const checkoutSessionDTO = StripeEventAdapter
                    .toCheckoutSessionCreated(
                        session,
                        subscription,
                    );
                await handlePaymentEventsUsecase.handleCheckoutSucceeded(
                    checkoutSessionDTO,
                );
                break;
            }
            case "invoice.payment_succeeded": {
                // Update le status de la souscription
                const invoicePaymentData = eventData as Stripe.Invoice;
                const subscriptionId = fromInvoiceToSubscription(
                    invoicePaymentData,
                );
                if (!subscriptionId) {
                    throw new ServerError(
                        HTTPStatus.BAD_REQUEST,
                        "No subscription ID found in invoice",
                    );
                }
                await handlePaymentEventsUsecase.handleInvoicePaymentSucceeded(
                    {
                        subscriptionId,
                        provider: "stripe",
                    },
                );
                break;
            }
            case "customer.subscription.updated": {
                const subscriptionUpdatedData =
                    eventData as Stripe.Subscription;
                const subscriptionDTO = StripeEventAdapter
                    .toSubscriptionUpdated(
                        subscriptionUpdatedData,
                    );
                await handlePaymentEventsUsecase.handleSubscriptionUpdated(
                    subscriptionDTO,
                );
                break;
            }
            case "customer.subscription.deleted": {
                const { id } = eventData as Stripe.Subscription;
                await handlePaymentEventsUsecase.handleSubscriptionDeleted(id);
                break;
            }
            case "invoice.payment_failed": {
                const paymentFailedData = eventData as Stripe.Invoice;
                const subscriptionId = fromInvoiceToSubscription(
                    paymentFailedData,
                );
                if (!subscriptionId) {
                    throw new ServerError(
                        HTTPStatus.BAD_REQUEST,
                        "No subscription ID found in invoice",
                    );
                }
                await handlePaymentEventsUsecase.handlePaymentFailed(
                    subscriptionId,
                );
                break;
            }
            default:
                console.log(
                    `No handler for Stripe event type: ${stripeEvent.type}`,
                );
        }
    } catch (error) {
        return handleError(error);
    }
});

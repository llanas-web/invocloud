import type Stripe from "stripe";
import { StripeHandlerContext } from "~~/server/lib/stripe/context";
import { fromUnix } from "~/utils/date";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

const getCustomerId = (customer: Stripe.Invoice["customer"]) => {
    if (typeof customer === "string") {
        return customer;
    } else if (customer && typeof customer === "object" && customer.id) {
        return customer.id;
    }
    return null;
};

export async function handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    ctx: StripeHandlerContext,
) {
    const customerId = getCustomerId(invoice.customer);
    const establishmentRepository = createEstablishmentRepository(ctx.supabase);
    if (!customerId) {
        console.warn("ℹ️ Invoice not tied to a subscription. Skipping.");
        return;
    }

    const { error } = await establishmentRepository.updateEstablishment(
        customerId,
        {
            subscription_end: fromUnix(invoice.period_end),
        },
    );

    if (error) {
        console.error(
            "❌ Failed to update subscription after invoice payment:",
            error,
        );
    } else {
        console.log(
            `✅ Invoice payment succeeded for customer=${customerId} and payment=${invoice.id}`,
        );
    }
}

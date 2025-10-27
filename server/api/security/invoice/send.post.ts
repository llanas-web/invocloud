import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { SendInvoiceByEmailCommandSchema } from "~~/shared/application/invoice/commands";

export default defineEventHandler(async (event) => {
    const { invoices } = useServerUsecases(event);
    const { invoiceIds, recipientEmail } = await parseBody(
        event,
        SendInvoiceByEmailCommandSchema,
    );

    await invoices.sendByEmail.execute({
        invoiceIds,
        recipientEmail,
    });
});

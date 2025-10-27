import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { RequestInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/request.contract";

export default defineEventHandler(async (event) => {
    const { invoices } = useServerUsecases(event);

    const { senderEmail, recipientEmail } = await parseBody(
        event,
        RequestInvoiceUploadSchema,
    );
    const establishments = await invoices.upload.checkUploadAuthorization
        .execute({
            senderEmail,
            recipientEmail,
        });
    return { establishments };
});

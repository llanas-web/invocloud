import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { RequestUploadInvoiceRequestSchema } from "~~/shared/contracts/api/security/upload/request.contract";

export default defineEventHandler(
    async (event) => {
        const { guestUploadSession } = useServerUsecases(event);
        const { senderEmail, recipientEmail } = await parseBody(
            event,
            RequestUploadInvoiceRequestSchema,
        );
        await guestUploadSession.initiate.execute({
            senderEmail,
            recipientEmail,
        });
    },
);

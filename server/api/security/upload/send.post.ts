import { useServerUsecases } from "~~/server/middleware/injection.middleware";
import { SendInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/send.contrat";

export default defineEventHandler(async (event) => {
    const { invoices } = useServerUsecases(event);

    const { establishmentId, supplierId, fileName, comment } = await parseBody(
        event,
        SendInvoiceUploadSchema,
    );

    return invoices.upload.createInvoiceFromUpload.execute({
        establishmentId,
        supplierId,
        fileName,
        comment,
    });
});

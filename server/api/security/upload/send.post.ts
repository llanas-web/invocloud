import { SendInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/send.contrat";
import CreateInvoiceFromUploadUsecase from "~~/shared/application/invoice/usecases/upload/create-invoice-from-upload.usecase";
import { useServerDi } from "~~/server/middleware/injection.middleware";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, storageRepository } = useServerDi(event);

        const { establishmentId, supplierId, fileName, comment } =
            await parseBody(
                event,
                SendInvoiceUploadSchema,
            );

        const createInvoiceFromUploadUsecase =
            new CreateInvoiceFromUploadUsecase(
                repos,
                queries,
                storageRepository,
            );

        return createInvoiceFromUploadUsecase.execute({
            establishmentId,
            supplierId,
            name: fileName,
            comment,
        });
    } catch (error) {
        return handleError(error);
    }
});

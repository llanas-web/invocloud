import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";
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

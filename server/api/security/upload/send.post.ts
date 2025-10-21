import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { useServerUsecases } from "~~/server/plugins/usecases.server";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import { AuthUserModel } from "~~/shared/types/models/auth-user.model";

const schema = z.object({
    invoiceId: z.uuid(),
    selectedEstablishmentId: z.uuid(),
    comment: z.string().optional(),
    fileName: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            auth,
            storage,
            database: { supplierRepository },
        },
        ctx: { userId },
    } = await buildRequestScope(event);
    const { usecases } = { usecases: useServerUsecases(event) };

    if (!userId || userId === "anonymous") {
        throw createError({ status: HTTPStatus.FORBIDDEN });
    }
    const userEmail = (auth.currentUser as AuthUserModel).email;

    const { invoiceId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            schema,
        );

    const signedUrl = await storage.createSignedUploadUrl(
        STORAGE_BUCKETS.INVOICES,
        `${selectedEstablishmentId}/${invoiceId}`,
    );

    const suppliers = await supplierRepository
        .getAllSuppliers({
            emails: [userEmail],
            establishmentIds: [selectedEstablishmentId],
        });

    await usecases.invoices.create.execute({
        filePath: `${selectedEstablishmentId}/${invoiceId}`,
        supplierId: suppliers[0].id,
        comment,
        name: fileName,
        source: "upload",
    });

    return signedUrl;
});

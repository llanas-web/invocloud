import { success, z } from "zod";
import createStorageRepository from "~~/shared/providers/database/supabase/repositories/storage.repository";
import createUploadRepository from "~~/shared/providers/database/supabase/repositories/upload-validation.repository";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";
import createInvoiceRepository from "~~/shared/providers/database/supabase/repositories/invoice.repository";
import createEstablishmentRepository from "~~/shared/providers/database/supabase/repositories/establishment.repository";
import createSupplierRepository from "~~/shared/providers/database/supabase/repositories/supplier.repository";

const schema = z.object({
    invoiceId: z.string().uuid(),
    selectedEstablishmentId: z.string().uuid(),
    comment: z.string().optional(),
    fileName: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { invoiceId, selectedEstablishmentId, comment, fileName } =
        await parseBody(
            event,
            schema,
        );
    const supabaseServiceRole = serverServiceRole(event);
    const user = await serverUser(event);
    if (!user) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }
    const invoiceRepository = createInvoiceRepository(supabaseServiceRole);
    const supplierRepository = createSupplierRepository(
        supabaseServiceRole,
    );
    const storageRepository = createStorageRepository(supabaseServiceRole);
    const { data: signedUrl } = await storageRepository.createSignedUploadUrl(
        `${selectedEstablishmentId}/${invoiceId}`,
    );
    const { data: supplier } = await supplierRepository
        .getSupplierByEmailAndEstablishmentId(
            user.email!,
            selectedEstablishmentId,
        );
    const { data, error } = await invoiceRepository.createInvoice([{
        id: invoiceId,
        file_path: `${selectedEstablishmentId}/${invoiceId}`,
        supplier_id: supplier!.id,
        comment,
        name: fileName,
    }]);
    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to upload file",
            data: error,
        });
    }
    const response = {
        success: true,
        url: signedUrl!.signedUrl,
        toJSON() {
            return {
                success: this.success,
                url: this.url,
            };
        },
    };
    return response;
});

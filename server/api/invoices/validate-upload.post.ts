import { z } from "zod";
import { parseBody } from "~~/server/lib/common";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";
import createInvoiceRepository from "#shared/repositories/invoice.repository";
import createStorageRepository from "#shared/repositories/storage.repository";
import createSupplierRepository from "#shared/repositories/supplier.repository";

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

    const supabase = serverServiceRole(event);
    const invoiceRepository = createInvoiceRepository(supabase);
    const storageRepository = createStorageRepository(supabase);
    const supplierRepository = createSupplierRepository(supabase);
    const user = await serverUser(event);
    if (!user) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }
    console.log("Authenticated user:", user.id);

    const filePath = `${selectedEstablishmentId}/${invoiceId}`;
    const { data: uploadUrl } = await storageRepository.createSignedUploadUrl(
        filePath,
    );

    if (!uploadUrl) {
        throw createError({
            status: 500,
            message: "Erreur lors de la création de l'URL signée",
        });
    }

    if (user.is_anonymous) {
        const { data: uploadValidation, error: uploadValidationError } =
            await supabase
                .from("upload_validations")
                .select("*")
                .eq("id", invoiceId)
                .eq("uploader_id", user.id)
                .maybeSingle();
        if (!uploadValidation) {
            throw createError({
                status: 404,
                message: "Validation de téléchargement introuvable",
            });
        }

        const { data: updatedUploadValidation, error: updateError } =
            await supabase.from("upload_validations").update({
                status: "uploaded",
                selected_establishment: selectedEstablishmentId,
                file_path: filePath,
            }).eq("id", invoiceId).select().single();
        if (updateError || !updatedUploadValidation) {
            throw createError({
                status: 500,
                message:
                    "Erreur lors de la mise à jour de la validation de téléchargement",
            });
        }
    } else {
        const { data: suppliers, error: supplierIdError } =
            await supplierRepository.getSuppliersByEstablishment(
                selectedEstablishmentId,
            );
        if (supplierIdError || !suppliers) {
            throw createError({
                status: 404,
                message: "Fournisseur introuvable",
            });
        }
        const supplierId = suppliers.find((s) =>
            s.emails.includes(user.email!)
        );
        if (!supplierId) {
            throw createError({
                status: 404,
                message: "Fournisseur introuvable",
            });
        }

        await invoiceRepository.createInvoice([{
            id: invoiceId,
            file_path: filePath,
            amount: 0,
            status: "pending",
            supplier_id: supplierId.id,
            comment,
            name: fileName,
            source: "upload",
        }]);
    }

    const response = {
        url: uploadUrl.signedUrl,
        toJSON() {
            return {
                url: this.url,
            };
        },
    };
    return response;
});

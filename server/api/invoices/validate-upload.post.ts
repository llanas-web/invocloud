import { z } from "zod";
import { parseBody } from "~~/server/lib/common";
import { serverServiceRole, serverUser } from "~~/server/lib/supabase/client";

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
    const user = await serverUser(event);
    if (!user) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }
    console.log("Authenticated user:", user.id);

    const filePath = `${selectedEstablishmentId}/${invoiceId}`;
    const { data: uploadUrl } = await supabase
        .storage
        .from("invoices")
        .createSignedUploadUrl(
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

        await supabase.from("upload_validations").update({
            status: "uploaded",
            selected_establishment: selectedEstablishmentId,
            file_path: filePath,
        }).eq("id", invoiceId);
    } else {
        const { data: supplierId, error: supplierIdError } = await supabase
            .from("suppliers")
            .select("id")
            .eq("establishment_id", selectedEstablishmentId)
            .overlaps("emails", [user.email])
            .single();
        if (supplierIdError || !supplierId) {
            throw createError({
                status: 404,
                message: "Fournisseur introuvable",
            });
        }

        await supabase.from("invoices").insert({
            id: invoiceId,
            file_path: filePath,
            amount: 0,
            status: "pending",
            supplier_id: supplierId.id,
            comment,
            name: fileName,
        });
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

import {
    InvoiceModel,
    InvoiceSource,
} from "~~/shared/domain/invoice/invoice.model";
import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const CreateInvoiceFromGuestSessionSchema = z.object({
    sessionId: z.uuid("ID de session invalide"),
    establishmentId: z.uuid("ID d'établissement invalide"),
    fileName: z.string().optional(),
    comment: z.string().optional(),
});

export type CreateInvoiceFromGuestSessionCommand = z.input<
    typeof CreateInvoiceFromGuestSessionSchema
>;

export default class CreateInvoiceFromGuestSessionUseCase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
    ) {}

    async execute(
        command: CreateInvoiceFromGuestSessionCommand,
    ) {
        const parsed = CreateInvoiceFromGuestSessionSchema.parse(command);

        // 1. Vérifier que la session existe et est vérifiée
        const session = await this.repos.guestUploadSessionsRepo.findById(
            parsed.sessionId,
        );
        if (!session) {
            return { success: false, error: "Session introuvable" };
        }

        if (!session.isVerified()) {
            return { success: false, error: "Session non vérifiée ou expirée" };
        }

        const suppliers = await this.queries.suppliersQuery.listSuppliers({
            emails: [session.senderEmail],
            establishmentIds: [parsed.establishmentId],
        });
        if (suppliers.length === 0) {
            return { success: false, error: "Fournisseur introuvable" };
        }
        const supplierId = suppliers[0]!.id;
        const newInvoiceId = crypto.randomUUID();
        // 2. Créer la facture
        const draftInvoice = InvoiceModel.createDraft({
            id: newInvoiceId,
            supplierId: supplierId,
            filePath: `${parsed.establishmentId}/${newInvoiceId}`,
            name: parsed.fileName ?? null,
            comment: parsed.comment ?? null,
            status: "pending",
            source: InvoiceSource.UPLOAD,
        });

        const createdInvoiceId = await this.repos.invoicesRepo.create(
            draftInvoice,
        );

        // 3. Supprimer la session (elle a été utilisée)
        await this.repos.guestUploadSessionsRepo.delete(session.id);

        return {
            success: true,
            value: { invoiceId: createdInvoiceId },
        };
    }
}

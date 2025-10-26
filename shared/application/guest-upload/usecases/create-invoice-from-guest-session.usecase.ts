import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { CreateInvoiceFromGuestSessionSchema } from "../command";
import {
    InvoiceModel,
    InvoiceSource,
} from "~~/shared/domain/invoice/invoice.model";
import type { SupplierQuery } from "../../supplier/supplier.query";

export class CreateInvoiceFromGuestSessionUseCase {
    constructor(
        private readonly sessionRepository: GuestUploadSessionRepository,
        private readonly invoiceRepository: InvoiceRepository,
        private readonly supplierQuery: SupplierQuery,
    ) {}

    async execute(
        raw: unknown,
    ) {
        const parsed = CreateInvoiceFromGuestSessionSchema.parse(raw);

        // 1. Vérifier que la session existe et est vérifiée
        const session = await this.sessionRepository.findById(
            parsed.sessionId,
        );
        if (!session) {
            return { success: false, error: "Session introuvable" };
        }

        if (!session.isVerified()) {
            return { success: false, error: "Session non vérifiée ou expirée" };
        }

        const suppliers = await this.supplierQuery.listSuppliers({
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

        const createdInvoiceId = await this.invoiceRepository.create(
            draftInvoice,
        );

        // 3. Supprimer la session (elle a été utilisée)
        await this.sessionRepository.delete(session.id);

        return {
            success: true,
            value: { invoiceId: createdInvoiceId },
        };
    }
}

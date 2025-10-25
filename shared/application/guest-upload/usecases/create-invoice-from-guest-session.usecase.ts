import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { CreateInvoiceFromGuestSessionSchema } from "../command";
import {
    InvoiceModel,
    InvoiceSource,
} from "~~/shared/domain/invoice/invoice.model";

export class CreateInvoiceFromGuestSessionUseCase {
    constructor(
        private readonly sessionRepository: GuestUploadSessionRepository,
        private readonly invoiceRepository: InvoiceRepository,
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

        // 2. Créer la facture
        const draftInvoice = InvoiceModel.createDraft({
            supplierId: parsed.supplierId,
            filePath: parsed.filePath,
            amount: parsed.amount,
            number: parsed.invoiceNumber,
            dueDate: parsed.dueDate,
            name: parsed.name ?? null,
            comment: parsed.comment ?? null,
            status: "pending",
            source: InvoiceSource.UPLOAD,
        });

        const newInvoiceId = await this.invoiceRepository.create(draftInvoice);

        // 3. Supprimer la session (elle a été utilisée)
        await this.sessionRepository.delete(session.id);

        return {
            success: true,
            value: { invoiceId: newInvoiceId },
        };
    }
}

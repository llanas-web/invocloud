import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import { CreateInvoiceFromUploadSchema } from "../../commands";
import type { StorageRepository } from "~~/shared/application/common/providers/storage/storage.repository";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";

export class CreateInvoiceFromUploadUsecase {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly establishmentRepository: EstablishmentRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(
        raw: unknown,
    ) {
        const parsed = CreateInvoiceFromUploadSchema.parse(raw);
        const newInvoiceId = crypto.randomUUID();
        const filePath = `${parsed.establishmentId}/${newInvoiceId}`;
        const newInvoice = InvoiceModel.createDraft({
            id: newInvoiceId,
            filePath: filePath,
            supplierId: parsed.supplierId,
            name: parsed.name,
            comment: parsed.comment,
            status: InvoiceStatus.PENDING,
            source: InvoiceSource.UPLOAD,
        });
        await this.invoiceRepository.create(newInvoice);

        return this.storageRepository
            .createSignedUploadUrl(
                STORAGE_BUCKETS.INVOICES,
                newInvoice.filePath,
            );
    }
}

import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import type { StorageRepository } from "~~/shared/application/common/providers/storage/storage.repository";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const CreateInvoiceFromUploadSchema = z.object({
    supplierId: z.uuid(),
    establishmentId: z.uuid(),
    comment: z.string().trim().optional(),
    name: z.string().trim(),
});
export type CreateInvoiceFromUploadCommand = z.input<
    typeof CreateInvoiceFromUploadSchema
>;

export default class CreateInvoiceFromUploadUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(command: CreateInvoiceFromUploadCommand) {
        const parsed = CreateInvoiceFromUploadSchema.parse(command);

        const newInvoiceId = crypto.randomUUID();
        const filePath = `${parsed.establishmentId}/${newInvoiceId}`;
        const newInvoice = InvoiceModel.createDraft({
            id: newInvoiceId,
            filePath: filePath,
            supplierId: parsed.supplierId,
            name: parsed.name,
            comment: parsed.comment,
            status: InvoiceStatus.DRAFT,
            source: InvoiceSource.UPLOAD,
        });
        await this.repos.invoicesRepo.create(newInvoice);

        return this.storageRepository
            .createSignedUploadUrl(
                STORAGE_BUCKETS.INVOICES,
                newInvoice.filePath,
            );
    }
}

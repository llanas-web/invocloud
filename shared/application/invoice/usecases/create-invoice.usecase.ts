import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import { CreateInvoiceCommandSchema } from "../commands";
import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import type { StorageRepository } from "../../common/providers/storage/storage.repository";

export class CreateInvoiceUsecase {
    constructor(
        private invoiceRepository: InvoiceRepository,
        private storageRepository: StorageRepository,
    ) {}

    async execute(raw: unknown) {
        const parsed = CreateInvoiceCommandSchema.parse(raw);
        const id = crypto.randomUUID();
        const filePath = `${parsed.establishmentId}/${id}`;
        const uploadUrl = await this.storageRepository.uploadFile(
            "invoices",
            filePath,
            parsed.file,
            {
                contentType: parsed.file.type,
                upsert: false,
            },
        );
        await $fetch(uploadUrl, {
            method: "PUT",
            body: parsed.file,
        });
        const entity = InvoiceModel.createDraft({
            status: parsed.status,
            supplierId: parsed.supplierId,
            name: parsed.name,
            amount: parsed.amount,
            emitDate: parsed.emitDate,
            dueDate: parsed.dueDate ?? null,
            paidAt: null,
            comment: parsed.comment ?? null,
            filePath: filePath,
            source: InvoiceSource.APP,
        });
        const newInvoiceId = await this.invoiceRepository.create(entity);
        return newInvoiceId;
    }
}

import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import type { StorageRepository } from "../../common/providers/storage/storage.repository";
import { z } from "zod";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";

export const CreateInvoiceCommandSchema = z.object({
    supplierId: z.uuid(),
    status: z.enum(InvoiceStatus).default(InvoiceStatus.VALIDATED),
    file: z.file(),
    establishmentId: z.uuid(),

    // optional fields
    name: z.string().trim().nullable().optional(),
    invoiceNumber: z.string().trim().nullable().optional(),
    amount: z.number().nullable().optional(),
    emitDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    paidAt: z.coerce.date().nullable().optional(),
    comment: z.string().trim().nullable().optional(),
});
export type CreateInvoiceCommand = z.input<typeof CreateInvoiceCommandSchema>;

export default class CreateInvoiceUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(command: CreateInvoiceCommand) {
        const parsed = CreateInvoiceCommandSchema.parse(command);
        const id = crypto.randomUUID();
        const filePath = `${parsed.establishmentId}/${id}`;
        const uploadUrl = await this.storageRepository.createSignedUploadUrl(
            "invoices",
            filePath,
        );
        await $fetch(uploadUrl, {
            method: "PUT",
            body: parsed.file,
        });
        const entity = InvoiceModel.createDraft({
            id: id,
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
        const newInvoiceId = await this.repos.invoicesRepo.create(entity);
        return newInvoiceId;
    }
}

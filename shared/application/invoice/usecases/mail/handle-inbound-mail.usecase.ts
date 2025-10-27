import type { StorageRepository } from "~~/shared/application/common/providers/storage/storage.repository";
import { ApplicationError } from "~~/shared/application/common/errors/application.error";
import { STORAGE_BUCKETS } from "~~/shared/application/common/providers/storage/types";
import {
    InvoiceModel,
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const HandleInboundMailCommand = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
    subject: z.string().optional(),
    attachments: z.array(
        z.object({
            name: z.string(),
            content: z.string(),
            contentType: z.string(),
        }),
    ),
});
export type HandleInboundMailCommand = z.input<
    typeof HandleInboundMailCommand
>;

export default class HandleInboundMailUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(command: HandleInboundMailCommand) {
        const parsed = HandleInboundMailCommand.parse(command);
        const {
            senderEmail,
            recipientEmail,
            subject,
            attachments,
        } = parsed;

        const localPartFull = recipientEmail.split("@")[0];
        const emailPrefix = localPartFull!.split("+")[0]!;

        const establishments = await this.queries.establishmentQuery
            .listEstablishments({
                emailPrefixes: [emailPrefix],
            });
        if (establishments.length === 0) {
            throw new ApplicationError("Establishment not found");
        }
        const establishmentFounded = establishments[0]!;
        const suppliers = await this.queries.suppliersQuery.listSuppliers({
            emails: [senderEmail],
        });
        if (suppliers.length === 0) {
            throw new ApplicationError("Supplier not found");
        }
        const supplier = suppliers[0]!;

        const listAttachmentsPdf = attachments.filter((a) =>
            a.contentType === "application/pdf"
        );
        if (listAttachmentsPdf.length === 0) {
            console.error(
                "No PDF attachments found in email from:",
                senderEmail,
            );
            throw new ApplicationError("No PDF attachments found");
        }

        for (const pdf of listAttachmentsPdf) {
            const newInvoiceId = crypto.randomUUID();
            const sanitizedName = (pdf.name || "invoice.pdf").replace(
                /[^a-zA-Z0-9._-]/g,
                "_",
            );
            const path = `${establishmentFounded.id}/${newInvoiceId}`;

            const buffer = Buffer.from(pdf.content, "base64");
            await this.storageRepository.uploadFile(
                STORAGE_BUCKETS.INVOICES,
                path,
                buffer as unknown as File,
                {
                    contentType: pdf.contentType || "application/pdf",
                    upsert: false,
                },
            );

            const newInvoice = InvoiceModel.create({
                id: newInvoiceId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: InvoiceStatus.PENDING,
                supplierId: supplier.id,
                filePath: path,
                name: sanitizedName,
                comment: subject ?? null,
                source: InvoiceSource.EMAIL,
            });
            await this.repos.invoicesRepo.create(newInvoice);
        }
    }
}

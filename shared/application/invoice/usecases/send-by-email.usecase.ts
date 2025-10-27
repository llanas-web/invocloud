import type { EmailRepository } from "../../common/providers/email/email.repository";
import type { StorageRepository } from "../../common/providers/storage/storage.repository";
import { STORAGE_BUCKETS } from "../../common/providers/storage/types";
import { z } from "zod";
import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";

export const SendInvoiceByEmailCommandSchema = z.object({
    invoiceIds: z.array(z.uuid()).nonempty(),
    recipientEmail: z.email(),
});
export type SendInvoiceByEmailCommand = z.input<
    typeof SendInvoiceByEmailCommandSchema
>;

export default class SendInvoiceByEmailUsecase {
    constructor(
        private readonly repos: Repositories,
        private readonly queries: Queries,
        private readonly emailRepository: EmailRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(command: SendInvoiceByEmailCommand) {
        const parsed = SendInvoiceByEmailCommandSchema.parse(command);

        const invoices = await this.queries.invoiceQuery.listInvoices({
            ids: parsed.invoiceIds,
        });

        const signedUrls = await this.storageRepository.createSignedUrls(
            STORAGE_BUCKETS.INVOICES,
            parsed.invoiceIds,
            60 * 60 * 24, // 24 hours
        );

        await this.emailRepository.sendEmail({
            to: [parsed.recipientEmail],
            subject: `Factures de InvoCloud`,
            html: `<p>Cher utilisateur,</p>
                       <p>Voici vos factures :</p>
                       <ul>${
                invoices.map((invoice, index) =>
                    `<li><a href="${
                        signedUrls[index]
                    }">${invoice.name}</a></li>`
                )
                    .join("")
            }</ul>
                       <p>Cordialement,</p>
                       <p>L'équipe InvoCloud</p>`,
        });
    }
}

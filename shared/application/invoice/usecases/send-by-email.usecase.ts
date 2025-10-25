import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import type { EmailRepository } from "../../common/providers/email/email.repository";
import { SendInvoiceByEmailCommandSchema } from "../commands";
import type { InvoiceQuery } from "../invoice.query";
import type { StorageRepository } from "../../common/providers/storage/storage.repository";
import { STORAGE_BUCKETS } from "../../common/providers/storage/types";

export class SendInvoiceByEmailUsecase {
    constructor(
        private readonly invoiceQuery: InvoiceQuery,
        private readonly emailRepository: EmailRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(raw: unknown): Promise<void> {
        const parsed = SendInvoiceByEmailCommandSchema
            .parse(raw);

        const invoices = await this.invoiceQuery.listInvoices({
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

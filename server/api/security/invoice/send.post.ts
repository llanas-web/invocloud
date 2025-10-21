import { z } from "zod";
import { buildRequestScope } from "~~/server/core/container";
import { useServerUsecases } from "~~/server/plugins/usecases.server";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";
import { AuthUserModel } from "~~/shared/types/models/auth-user.model";

const schema = z.object({
    invoiceIds: z.array(z.uuid()),
    email: z.email(),
});

export default defineEventHandler(async (event) => {
    const {
        deps: {
            storage,
            auth,
            email: emailRepository,
        },
        ctx: { userId },
    } = await buildRequestScope(event);
    const { usecases } = { usecases: useServerUsecases(event) };

    const { invoiceIds, email } = await parseBody(event, schema);

    if (!userId || userId === "anonymous") {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }

    const invoices = await usecases.invoices.list.execute({
        ids: invoiceIds,
    });

    const signedUrls = await storage.createSignedUrls(
        STORAGE_BUCKETS.INVOICES,
        invoices.map((invoice) => invoice.filePath),
        60 * 60 * 24, // 24 hours
    );

    await emailRepository.sendEmail({
        to: [email],
        subject: `Factures de ${(auth.currentUser as AuthUserModel).email}`,
        html: `<p>Cher utilisateur,</p>
               <p>Voici vos factures :</p>
               <ul>${
            invoices.map((invoice, index) =>
                `<li><a href="${signedUrls[index]}">${invoice.name}</a></li>`
            )
                .join("")
        }</ul>
               <p>Cordialement,</p>
               <p>L'équipe InvoCloud</p>`,
    });
});

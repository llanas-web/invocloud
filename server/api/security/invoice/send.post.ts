import { z } from "zod";
import { sendEmail } from "~~/server/lib/email";
import {
    serverClient,
    serverServiceRole,
    serverUser,
} from "~~/server/lib/supabase/client";
import createInvoiceRepository from "#shared/repositories/invoice.repository";
import createStorageRepository from "#shared/repositories/storage.repository";

const schema = z.object({
    invoices: z.array(z.uuid()),
    email: z.email(),
});

export default defineEventHandler(async (event) => {
    const { invoices, email } = await parseBody(event, schema);
    const supabase = await serverClient(event);
    const invoiceRepository = createInvoiceRepository(supabase);
    const storageRepository = createStorageRepository(supabase);
    const user = await serverUser(event);
    const supabaseAdmin = serverServiceRole(event);

    if (!user) {
        throw createError({
            status: 401,
            message: "Utilisateur non authentifié",
        });
    }

    const { data: invoicesData, error: invoicesError } = await invoiceRepository
        .getInvoicesByIds(invoices);
    if (invoicesError) {
        throw createError({
            status: 500,
            message: "Erreur lors de la récupération des factures",
        });
    }
    const { data, error } = await storageRepository.createSignedUrls(
        invoicesData.map((invoice) => invoice.file_path!),
        60 * 60 * 24, // 24 hours
    );
    if (error) {
        throw createError({
            status: 500,
            message: "Erreur lors de la création des URLs signées",
        });
    }
    const populatedInvoicesWithSignedUrl = invoicesData.map((
        invoice,
        index,
    ) => ({
        signedUrl: data[index].signedUrl,
        ...invoice,
    }));
    const signedUrls = data.map((item) => item.signedUrl);

    const emailSend = await sendEmail(
        [email],
        `Factures de ${user.email}`,
        `<p>Cher utilisateur,</p>
               <p>Voici vos factures :</p>
               <ul>${
            populatedInvoicesWithSignedUrl.map((invoice) =>
                `<li><a href="${invoice.signedUrl}">${invoice.name}</a></li>`
            )
                .join("")
        }</ul>
               <p>Cordialement,</p>
               <p>L'équipe InvoCloud</p>`,
    );
    if (!emailSend) {
        throw createError({
            status: 500,
            message: "Erreur lors de l'envoi des factures",
        });
    }
    return {
        success: true,
        message: "Factures envoyées avec succès",
    };
});

import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";

const { emails } = useResend();

export default defineEventHandler(async (event) => {
    const body = await readBody<{ invoices: string[]; email: string }>(event);
    const { invoices, email } = body;
    if (!invoices || !email) {
        throw createError({
            status: 400,
            message: "Missing invoice ID or email",
        });
    }
    const supabase = await serverSupabaseClient(event);
    const supabaseAdmin = await serverSupabaseServiceRole(event);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }
    const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("name, file_path")
        .in("id", invoices);
    if (invoicesError) {
        throw createError({
            status: 500,
            message: "Error fetching invoices",
        });
    }
    const { data, error } = await supabaseAdmin.storage.from("invoices")
        .createSignedUrls(
            invoicesData.map((invoice) => invoice.file_path!),
            60 * 60 * 24, // 24 hours
        );
    if (error) {
        throw createError({
            status: 500,
            message: "Error creating signed URLs",
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
    const { data: emailData, error: emailError } = await emails.send({
        from: "InvoCloud <tech@llanas.dev>",
        to: [email],
        subject: `Factures de ${user.email}`,
        html: `<p>Dear user,</p>
               <p>Here are your invoices:</p>
               <ul>${
            populatedInvoicesWithSignedUrl.map((invoice) =>
                `<li><a href="${invoice.signedUrl}">${invoice.name}</a></li>`
            )
                .join("")
        }</ul>
               <p>Best regards,</p>
               <p>InvoCloud Team</p>`,
    });
    if (emailError) {
        throw createError({
            status: 500,
            message: "Error sending invoices",
        });
    }
    return {
        success: true,
        message: "Invoices sent successfully",
        data: emailData,
    };
});

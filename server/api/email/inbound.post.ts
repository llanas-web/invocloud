import { defineEventHandler, setResponseStatus } from "h3";
import { serverServiceRole } from "~~/server/lib/supabase/client";
import { InvoiceInsert } from "~~/types";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";
import createInvoiceRepository from "#shared/repositories/invoice.repository";

type PostmarkInbound = {
    From: string;
    FromFull: { Email: string; Name: string };
    To: string;
    ToFull: { Email: string; Name: string }[];
    Cc: string;
    CcFull: { Email: string; Name: string }[];
    Bcc: string;
    BccFull: { Email: string; Name: string }[];
    Subject: string;
    TextBody: string;
    HtmlBody: string;
    Tag: string;
    MessageID: string;
    Attachments: {
        Name: string;
        ContentType: string;
        ContentLength: number;
        Content: string; // base64
    }[];
    OriginalRecipient: string;
    CampaignID: string | null;
    MessageStream: string;
};

export default defineEventHandler(async (event) => {
    // Expect Basic Auth: "Basic base64(username:password)"
    const auth = event.node.req.headers.authorization || "";
    const expectedUser = process.env.INBOUND_BASIC_USER;
    const expectedPass = process.env.INBOUND_BASIC_PASS;

    console.log("Inbound auth:", auth ? "provided" : "missing");
    console.log("Expected user:", expectedUser ? "set" : "missing");
    console.log("Expected pass:", expectedPass ? "set" : "missing");

    const ok = auth.startsWith("Basic ") &&
        (() => {
            const [u, p] = Buffer.from(auth.slice(6), "base64").toString("utf8")
                .split(":");
            return u === expectedUser && p === expectedPass;
        })();

    if (!ok) {
        setResponseStatus(event, 401);
        return { error: "Unauthorized" };
    }
    console.log("Inbound auth: successful");

    // Postmark sends JSON for inbound
    const {
        FromFull: sender,
        ToFull: recipients,
        Subject: subject,
        Attachments: attachments,
    } = await readBody<PostmarkInbound>(event);

    if (attachments.length === 0) {
        console.error("No attachments found in email from:", sender.Email);
        throw createError({ status: 400, message: "No attachments found" });
    }

    // TODO: lookup alias -> établissement, stockage, création facture
    console.log("[INBOUND]", {
        from: sender.Email,
        to: recipients.map((t) => t.Email),
        subject,
        attachments: attachments.map((a) => ({
            name: a.Name,
            type: a.ContentType,
            size: a.ContentLength,
        })),
    });

    const supabaseServiceRole = serverServiceRole(event);
    const establishmentRepository = createEstablishmentRepository(
        supabaseServiceRole,
    );
    const invoiceRepository = createInvoiceRepository(supabaseServiceRole);

    const recipientEmail = recipients?.[0]?.Email?.toLowerCase();
    if (!sender?.Email || !recipientEmail) {
        throw createError({ status: 400, message: "Invalid email data" });
    }

    // local-part: remove '+tag' if present
    const localPartFull = recipientEmail.split("@")[0]; // e.g. "eurl-llanas+tag"
    const emailPrefix = localPartFull.split("+")[0];

    // 1) Trouver l'établissement par email_prefix
    const { data: est, error: estErr } = await establishmentRepository
        .getEstablishmentByPrefix(emailPrefix);
    if (estErr || !est) {
        throw createError({ status: 404, message: "Unknown recipient alias" });
    }

    console.log("Matched establishment:", est.id, est.email_prefix);
    console.log("sender.Email:", sender.Email);
    console.log("recipientEmail:", recipientEmail);

    const { data: supplier, error: suppliersError } = await supabaseServiceRole
        .from("suppliers").select("*").eq("establishment_id", est.id).overlaps(
            "emails",
            [sender.Email],
        ).maybeSingle();

    if (suppliersError || !supplier) {
        console.error("Supplier lookup error:", suppliersError);
        throw createError({
            status: 403,
            message: "Sender not authorized for this establishment",
        });
    }
    console.log("Authorized sender for establishment:", est.id);

    const listAttachmentsPdf = attachments.filter((a) =>
        a.ContentType === "application/pdf"
    );
    if (listAttachmentsPdf.length === 0) {
        console.error("No PDF attachments found in email from:", sender.Email);
        throw createError({ status: 400, message: "No PDF attachments found" });
    }

    const listUploadedInvoices = await Promise.all(
        listAttachmentsPdf.map(async (a) => {
            const newInvoiceId = crypto.randomUUID();
            const sanitizedName = (a.Name || "invoice.pdf").replace(
                /[^a-zA-Z0-9._-]/g,
                "_",
            );
            const path = `${est.id}/${newInvoiceId}/${sanitizedName}`;

            // 4) Upload Storage
            const { error: uploadError } = await supabaseServiceRole
                .storage.from("invoices")
                .upload(path, Buffer.from(a.Content, "base64"), {
                    contentType: a.ContentType ||
                        "application/octet-stream",
                    upsert: false,
                });
            console.log("Attachment uploaded to path:", path);
            return { id: newInvoiceId, path };
        }),
    );

    const listNewInvoices: InvoiceInsert[] = listUploadedInvoices.map((
        { id, path },
    ) => ({
        id,
        supplier_id: supplier.id,
        file_path: path,
        comment: subject,
        source: "email",
    }));

    const { data: invoices, error: invoiceError } = await invoiceRepository
        .createInvoice(listNewInvoices);

    if (invoiceError) {
        console.error("Invoice creation error:", invoiceError);
        throw createError({ status: 500, message: "Invoice creation failed" });
    }
    console.log(
        "Invoice record created, id:",
        invoices.map((inv) => inv.id).join(", "),
    );

    return { ok: true };
});

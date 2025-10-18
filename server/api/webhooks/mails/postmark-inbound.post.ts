import { defineEventHandler, setResponseStatus } from "h3";
import { buildRequestScope } from "~~/server/core/container";
import { HTTPStatus } from "~~/server/core/errors/status";
import { STORAGE_BUCKETS } from "~~/shared/providers/storage/types";

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
        throw createError({ status: HTTPStatus.UNAUTHORIZED });
    }

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

    const {
        deps: {
            repos: {
                establishmentRepository,
                supplierRepository,
                invoiceRepository,
            },
            storage,
        },
    } = await buildRequestScope(event);

    const recipientEmail = recipients?.[0]?.Email?.toLowerCase();
    if (!sender?.Email || !recipientEmail) {
        throw createError({ status: 400, message: "Invalid email data" });
    }

    // local-part: remove '+tag' if present
    const localPartFull = recipientEmail.split("@")[0]; // e.g. "eurl-llanas+tag"
    const emailPrefix = localPartFull.split("+")[0];

    // 1) Trouver l'établissement par email_prefix
    const establishments = await establishmentRepository.getAllEstablishments({
        prefixEmails: [emailPrefix],
    });
    if (establishments.length === 0) {
        throw createError({ status: HTTPStatus.FORBIDDEN });
    }

    const est = establishments[0];
    const suppliers = await supplierRepository
        .getAllSuppliers({
            establishmentIds: [est.id],
            emails: [sender.Email],
        });

    if (suppliers.length === 0) {
        throw createError({
            status: 403,
            message: "Sender not authorized for this establishment",
        });
    }

    const listAttachmentsPdf = attachments.filter((a) =>
        a.ContentType === "application/pdf"
    );
    if (listAttachmentsPdf.length === 0) {
        console.error("No PDF attachments found in email from:", sender.Email);
        throw createError({ status: 400, message: "No PDF attachments found" });
    }

    await Promise.all(
        listAttachmentsPdf.map(async (a) => {
            const newInvoiceId = crypto.randomUUID();
            const sanitizedName = (a.Name || "invoice.pdf").replace(
                /[^a-zA-Z0-9._-]/g,
                "_",
            );
            const path = `${est.id}/${newInvoiceId}/${sanitizedName}`;

            const url = await storage
                .uploadFile(
                    STORAGE_BUCKETS.INVOICES,
                    path,
                    Buffer.from(a.Content, "base64") as unknown as File,
                    {
                        contentType: a.ContentType ||
                            "application/octet-stream",
                        upsert: false,
                    },
                );
            await invoiceRepository
                .createInvoice({
                    supplier_id: suppliers[0].id,
                    file_path: path,
                    comment: subject,
                    source: "email",
                });
        }),
    );
});

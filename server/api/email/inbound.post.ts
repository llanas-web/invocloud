// server/api/inbound.post.ts
import { defineEventHandler, readBody, setResponseStatus } from "h3";
import crypto from "node:crypto";

function verifyPostmarkSignature(
    raw: string,
    signature: string | undefined,
    token: string,
) {
    if (!signature) return false;
    const hmac = crypto.createHmac("sha256", token).update(raw).digest(
        "base64",
    );
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(hmac),
        );
    } catch {
        return false;
    }
}

export default defineEventHandler(async (event) => {
    // Postmark envoie du JSON
    const rawBody = await readBody(event); // Nuxt parse déjà en objet
    const rawText = (event.node.req as any).rawBody ?? JSON.stringify(rawBody); // fallback

    // Vérif signature (Inbound Hook Token à mettre en secret)
    const signature = event.node.req.headers["x-postmark-signature"] as
        | string
        | undefined;
    const ok = verifyPostmarkSignature(
        typeof rawText === "string" ? rawText : JSON.stringify(rawBody),
        signature,
        process.env.POSTMARK_INBOUND_HOOK_TOKEN || "",
    );
    if (!ok) {
        setResponseStatus(event, 401);
        return { error: "Bad signature" };
    }

    // TODO: lookup alias -> établissement, stockage, création facture
    console.log("[INBOUND]", {
        from: rawBody?.FromFull?.Email,
        to: rawBody?.ToFull?.map((t: any) => t.Email),
        subject: rawBody?.Subject,
        attachments: rawBody?.Attachments?.map((a: any) => ({
            name: a.Name,
            type: a.ContentType,
            size: a.ContentLength,
        })),
    });

    return { ok: true };
});

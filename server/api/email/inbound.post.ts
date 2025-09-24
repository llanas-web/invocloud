import { defineEventHandler, setResponseStatus } from "h3";

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

    // Postmark sends JSON for inbound
    const body = await readBody(event);

    // TODO: lookup alias -> établissement, stockage, création facture
    console.log("[INBOUND]", {
        from: body?.FromFull?.Email,
        to: body?.ToFull?.map((t: any) => t.Email),
        subject: body?.Subject,
        attachments: body?.Attachments?.map((a: any) => ({
            name: a.Name,
            type: a.ContentType,
            size: a.ContentLength,
        })),
    });

    return { ok: true };
});

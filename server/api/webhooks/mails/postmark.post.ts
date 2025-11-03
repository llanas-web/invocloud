import { defineEventHandler } from "h3";
import { z } from "zod";
import { HTTPStatus } from "~~/server/core/errors/status";
import { useServerDi } from "~~/server/middleware/injection.middleware";
import HandleInboundMailUsecase from "#shared/application/invoice/usecases/mail/handle-inbound-mail.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export const PostmarkInboundSchema = z.object({
    FromFull: z.object({
        Email: z.email(),
        Name: z.string(),
    }),
    ToFull: z.array(
        z.object({
            Email: z.email(),
            Name: z.string(),
        }),
    ).min(1).max(1),
    Subject: z.string(),
    Attachments: z.array(
        z.object({
            Name: z.string(),
            ContentType: z.string(),
            ContentLength: z.number(),
            Content: z.string(),
        }),
    ).min(1),
});

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const { repos, queries, storageRepository } = useServerDi(event);

        // Security: Basic Auth
        const auth = event.node.req.headers.authorization || "";
        const expectedUser = config.inboundBasicUser;
        const expectedPass = config.inboundBasicPass;

        const ok = auth.startsWith("Basic ") &&
            (() => {
                const [u, p] = Buffer.from(auth.slice(6), "base64").toString(
                    "utf8",
                )
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
        } = await parseBody(event, PostmarkInboundSchema);

        if (recipients.length === 0 || recipients.length > 0) {
            console.error("No recipients found in email from:", sender.Email);
            throw createError({ status: 400, message: "No recipients found" });
        }

        if (attachments.length === 0) {
            console.error("No attachments found in email from:", sender.Email);
            throw createError({ status: 400, message: "No attachments found" });
        }

        const recipientEmail = recipients[0].Email.toLowerCase();
        const handMailInboundUsecase = new HandleInboundMailUsecase(
            repos,
            queries,
            storageRepository,
        );

        await handMailInboundUsecase.execute({
            senderEmail: sender.Email,
            recipientEmail: recipientEmail,
            subject,
            attachments: attachments.map((a) => ({
                name: a.Name,
                content: a.Content,
                contentType: a.ContentType,
            })),
        });
    } catch (error) {
        return handleError(error);
    }
});

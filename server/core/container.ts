import { EventHandlerRequest, getHeader, H3Event } from "h3";
import { Deps, RequestContext } from "./types";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import StorageFactory from "~~/shared/providers/storage/storage.factory";
import AuthFactory from "~~/shared/providers/auth/auth.factory";
import OcrFactory from "~~/shared/providers/ocr/ocr.factory";
import EmailFactory from "~~/shared/providers/email/email.factory";
import PaymentFactory from "~~/server/lib/providers/payments/payment.factory";
import { HTTPStatus } from "./errors/status";
import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";

export async function buildRequestScope(
    event: H3Event<EventHandlerRequest>,
): Promise<{ ctx: RequestContext; deps: Deps }> {
    const requestId = getHeader(event, "x-request-id") ?? crypto.randomUUID();

    const user = await serverSupabaseUser(event);
    const ss = serverSupabaseServiceRole(event);
    const sc = await serverSupabaseClient(event);

    const authentProtection = (allowAnonyme = false) => {
        if (!user || (!allowAnonyme && user.is_anonymous)) {
            throw createError({ status: HTTPStatus.FORBIDDEN });
        }
    };

    const ctx: RequestContext = {
        requestId,
        userId: user?.id ?? "anonymous",
        ip: getRequestIP(event) ?? undefined,
        now: () => new Date(),
        authentProtection,
    };

    const deps: Deps = {
        storage: StorageFactory.getInstance(ss),
        auth: AuthFactory.getInstance(sc),
        ocr: OcrFactory.getInstance("mindee"),
        email: EmailFactory.getInstance("resend"),
        payment: PaymentFactory.getInstance("stripe"),
        database: DatabaseFactory.getInstance(ss),
    };

    return { ctx, deps };
}

import { EventHandlerRequest, getHeader, H3Event } from "h3";
import { Deps, RequestContext } from "./types";
import {
    serverServiceRole,
    serverUser,
} from "~~/shared/providers/database/supabase/client";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import StorageFactory from "~~/shared/providers/storage/storage.factory";

export async function buildRequestScope(
    event: H3Event<EventHandlerRequest>,
): Promise<{ ctx: RequestContext; deps: Deps }> {
    const user = await serverUser(event);
    const requestId = getHeader(event, "x-request-id") ?? crypto.randomUUID();

    const ss = serverServiceRole(event);
    const { getRepository } = DatabaseFactory.getInstance(ss);
    const storageProvider = StorageFactory.getInstance(ss);

    const ctx: RequestContext = {
        requestId,
        userId: user?.id ?? "anonymous",
        ip: getRequestIP(event) ?? undefined,
        now: () => new Date(),
    };

    const deps: Deps = {
        storage: storageProvider,
        repos: {
            uploadValidationRepository: getRepository(
                "uploadValidationRepository",
            ),
            establishmentRepository: getRepository("establishmentRepository"),
            invoiceRepository: getRepository("invoiceRepository"),
            supplierRepository: getRepository("supplierRepository"),
            userRepository: getRepository("userRepository"),
            authRepository: getRepository("authRepository"),
            adminRepository: getRepository("adminRepository"),
        },
    };
    return { ctx, deps };
}

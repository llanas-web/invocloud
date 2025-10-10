import { EventHandlerRequest, getHeader, H3Event } from "h3";
import { Deps, RequestContext } from "./types";
import {
    serverClient,
    serverServiceRole,
    serverUser,
} from "~~/shared/providers/database/supabase/client";
import {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "~~/shared/providers/database/supabase/repositories";
import SupabaseAuthRepository from "#shared/providers/auth/supabase/auth.repository";
import { sendEmail } from "../lib/providers/email";

export async function buildRequestScope(
    event: H3Event<EventHandlerRequest>,
): Promise<{ ctx: RequestContext; deps: Deps }> {
    const user = await serverUser(event);
    const requestId = getHeader(event, "x-request-id") ?? crypto.randomUUID();

    const ss = serverServiceRole(event);

    const ctx: RequestContext = {
        requestId,
        userId: user?.id ?? "anonymous",
        ip: getRequestIP(event) ?? undefined,
        now: () => new Date(),
    };

    const deps: Deps = {
        repos: {
            uploadValidationRepository: new UploadValidationRepository(ss),
            establishmentRepository: new EstablishmentRepository(ss),
            invoiceRepository: new InvoiceRepository(ss),
            supplierRepository: new SupplierRepository(ss),
            userRepository: new UserRepository(ss),
            authRepository: new SupabaseAuthRepository(ss),
            adminRepository: new AdminRepository(ss),
        },
    };
    return { ctx, deps };
}

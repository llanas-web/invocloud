import { eventHandler } from "h3";
import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";
import ResendEmailRepository from "~~/server/infra/resend/email.resend.repository";
import PaymentStripeRepository from "~~/server/infra/stripe/payment.stripe.repository";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";
import { OcrMindeeRepository } from "~~/server/infra/mindee/mindee.ocr.repository";
import { Database } from "~~/shared/infra/common/supabase/database.types";
import { Repositories } from "~~/shared/domain/common/repositories.factory";
import { Queries } from "~~/shared/domain/common/queries.factory";
import { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import { StorageRepository } from "~~/shared/application/common/providers/storage/storage.repository";
import { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";
import { EmailRepository } from "~~/shared/application/common/providers/email/email.repository";
import { OcrRepository } from "~~/shared/application/common/providers/ocr/ocr.repository";
import { AdminRepository } from "~~/shared/application/common/providers/auth/admin.repository";
import AdminSupabaseRepository from "../infra/supabase/admin.supabase.repository";

export default eventHandler(async (event) => {
    const serviceRoleClient = serverSupabaseServiceRole<Database>(
        event,
    );
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    const repos = new RepositoriesSupabaseFactory(
        serviceRoleClient,
    );
    const queries = new QueriesSupabaseFactory(serviceRoleClient);
    const storageRepository = new StorageSupabaseRepository(
        serviceRoleClient,
    );
    const paymentRepository = new PaymentStripeRepository();
    const emailRepository = new ResendEmailRepository();
    const ocrRepository = new OcrMindeeRepository();
    const authRepository = new AuthSupabaseRepository(
        supabaseClient,
        user,
    );
    const adminRepository = new AdminSupabaseRepository(serviceRoleClient);
    await authRepository.getCurrentUser();

    event.context.di = {
        repos: repos.repositories,
        queries: queries.queries,
        authRepository,
        storageRepository,
        paymentRepository,
        emailRepository,
        ocrRepository,
        adminRepository,
    } as ServerDi;
});

export type ServerDi = {
    repos: Repositories;
    queries: Queries;
    authRepository: AuthRepository;
    storageRepository: StorageRepository;
    paymentRepository: PaymentRepository;
    emailRepository: EmailRepository;
    ocrRepository: OcrRepository;
    adminRepository: AdminRepository;
};

// helper d’accès
export function useServerDi(event: any): ServerDi {
    return (event as any).di ?? event.context.di as ServerDi;
}

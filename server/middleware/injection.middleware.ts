import { eventHandler } from "h3";
import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
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

export default eventHandler(async (event) => {
    const serviceRoleClient = serverSupabaseServiceRole<Database>(
        event,
    );
    const supabaseClient = await serverSupabaseClient<Database>(event);
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
    );
    await authRepository.getCurrentUser();

    event.context.di = {
        repos: repos.repositories,
        queries: queries.queries,
        authRepository,
        storageRepository,
        paymentRepository,
        emailRepository,
        ocrRepository,
    } as ServerDi;
});

export type ServerDi = {
    repos: Repositories;
    queries: Queries;
    authRepository: AuthSupabaseRepository;
    storageRepository: StorageSupabaseRepository;
    paymentRepository: PaymentStripeRepository;
    emailRepository: ResendEmailRepository;
    ocrRepository: OcrMindeeRepository;
};

// helper d’accès
export function useServerDi(event: any): ServerDi {
    return (event as any).di ?? event.context.di as ServerDi;
}

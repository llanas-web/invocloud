import { eventHandler } from "h3";
import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import { makeUseCasesServer } from "~~/shared/application/common/usecase.server.factory";
import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";
import ResendEmailRepository from "~~/server/infra/resend/email.resend.repository";
import PaymentStripeRepository from "~~/server/infra/stripe/payment.stripe.repository";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";
import { OcrMindeeRepository } from "~~/server/infra/mindee/mindee.ocr.repository";
import { Database } from "~~/shared/infra/common/supabase/database.types";

export default eventHandler(async (event) => {
    const serviceRoleClient = serverSupabaseServiceRole<Database>(
        event,
    );
    const supabaseClient = await serverSupabaseClient<Database>(event);
    const repositoryFactory = new RepositoriesSupabaseFactory(
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

    event.context.usecases = makeUseCasesServer(
        repositoryFactory,
        queries,
        paymentRepository,
        storageRepository,
        emailRepository,
        authRepository,
        ocrRepository,
    );
    event.context.authRepository = authRepository;
});
// helper d’accès
export function useServerUsecases(event: any) {
    return ((event as any).usecases ??
        event.context.usecases) as ReturnType<typeof makeUseCasesServer>;
}
export function useServerAuthRepository(event: any) {
    return (event as any).authRepository ??
        event.context.authRepository as AuthSupabaseRepository;
}

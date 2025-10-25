import { serverSupabaseServiceRole } from "#supabase/server";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import { makeUseCasesServer } from "~~/shared/application/common/usecase.server.factory";
import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";
import ResendEmailRepository from "~~/server/infra/resend/email.resend.repository";
import PaymentStripeRepository from "../infra/stripe/payment.stripe.repository";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";
import { OcrMindeeRepository } from "../infra/mindee/mindee.ocr.repository";
import { Database } from "~~/shared/infra/common/supabase/database.types";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("request", (event) => {
        const supabaseClient = serverSupabaseServiceRole<Database>(event);
        const repositoryFactory = new RepositoriesSupabaseFactory(
            supabaseClient,
        );
        const queries = new QueriesSupabaseFactory(supabaseClient);
        const storageRepository = new StorageSupabaseRepository(supabaseClient);
        const paymentRepository = new PaymentStripeRepository();
        const emailRepository = new ResendEmailRepository();
        const ocrRepository = new OcrMindeeRepository();
        const authRepository = new AuthSupabaseRepository(supabaseClient);

        (event as any).usecases = makeUseCasesServer(
            repositoryFactory,
            queries,
            paymentRepository,
            storageRepository,
            emailRepository,
            authRepository,
            ocrRepository,
        );
    });
});

// helper d’accès
export function useServerUsecases(event: any) {
    return (event as any).usecases as ReturnType<typeof makeUseCasesServer>;
}

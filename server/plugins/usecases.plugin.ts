import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import { makeUseCasesServer } from "~~/shared/application/common/usecase.server.factory";
import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";
import ResendEmailRepository from "~~/server/infra/resend/email.resend.repository";
import PaymentStripeRepository from "../infra/stripe/payment.stripe.repository";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";

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
        const authRepository = new AuthSupabaseRepository(supabaseClient);

        (event as any).usecases = makeUseCasesServer(
            repositoryFactory,
            queries,
            paymentRepository,
            storageRepository,
            emailRepository,
            authRepository,
        );
    });
});

// helper d’accès
export function useServerUsecases(event: any) {
    return (event as any).usecases as ReturnType<typeof makeUseCasesServer>;
}

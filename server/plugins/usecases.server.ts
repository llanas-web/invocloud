import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { SupabaseRepositoryFactory } from "~~/shared/infra/common/supabase/supabase-repository.factory";
import { SupabaseQueryFactory } from "~~/shared/infra/common/supabase/supabase-query.factory";
import { makeUseCases } from "~~/shared/application/common/usecase.factory";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("request", (event) => {
        const supabaseClient = serverSupabaseServiceRole<Database>(event);
        const repositoryFactory = new SupabaseRepositoryFactory(supabaseClient);
        const queryFactory = new SupabaseQueryFactory(supabaseClient);
        (event as any).usecases = makeUseCases(repositoryFactory, queryFactory);
    });
});

// helper d’accès
export function useServerUsecases(event: any) {
    return (event as any).usecases as ReturnType<typeof makeUseCases>;
}

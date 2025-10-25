import { makeUseCasesClient } from "~~/shared/application/common/usecase.client.factory";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";

export default defineNuxtPlugin((nuxtApp) => {
    const sb = useSupabaseClient<Database>();
    const repoFactory = new RepositoriesSupabaseFactory(sb);
    const queryFactory = new QueriesSupabaseFactory(sb);
    const usecases = makeUseCasesClient(repoFactory, queryFactory);

    return { provide: { usecases } };
});

// Typage
declare module "#app" {
    interface NuxtApp {
        $usecases: ReturnType<typeof makeUseCasesClient>;
    }
}
declare module "vue" {
    interface ComponentCustomProperties {
        $usecases: ReturnType<typeof makeUseCasesClient>;
    }
}

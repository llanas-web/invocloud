import { makeUseCases } from "~~/shared/application/common/usecase.factory";
import { SupabaseQueryFactory } from "~~/shared/infra/common/supabase/supabase-query.factory";
import { SupabaseRepositoryFactory } from "~~/shared/infra/common/supabase/supabase-repository.factory";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";

export default defineNuxtPlugin((nuxtApp) => {
    const sb = useSupabaseClient<Database>();
    const repoFactory = new SupabaseRepositoryFactory(sb);
    const queryFactory = new SupabaseQueryFactory(sb);
    const usecases = makeUseCases(repoFactory, queryFactory);

    return { provide: { usecases } };
});

// Typage
declare module "#app" {
    interface NuxtApp {
        $usecases: ReturnType<typeof makeUseCases>;
    }
}
declare module "vue" {
    interface ComponentCustomProperties {
        $usecases: ReturnType<typeof makeUseCases>;
    }
}

import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import { makeUseCasesClient } from "~~/shared/application/common/usecase.client.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";
import type { Database } from "~~/shared/infra/common/supabase/database.types";
import { QueriesSupabaseFactory } from "~~/shared/infra/common/supabase/queries.supabase.factory";
import { RepositoriesSupabaseFactory } from "~~/shared/infra/common/supabase/repositories.supabase.factory";
import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";

export default defineNuxtPlugin((nuxtApp) => {
    const sb = useSupabaseClient<Database>();
    const repoFactory = new RepositoriesSupabaseFactory(sb);
    const queryFactory = new QueriesSupabaseFactory(sb);
    const storageRepository = new StorageSupabaseRepository(sb);
    const authRepository = new AuthSupabaseRepository(sb);

    const usecases = makeUseCasesClient(
        repoFactory,
        queryFactory,
        storageRepository,
    );

    return {
        provide: {
            usecases,
            queries: queryFactory.queries,
            storageRepository,
            authRepository,
        },
    };
});

// Typage
declare module "#app" {
    interface NuxtApp {
        $usecases: ReturnType<typeof makeUseCasesClient>;
        $queries: Queries;
        $storageRepository: StorageSupabaseRepository;
        $authRepository: AuthRepository;
    }
}
declare module "vue" {
    interface ComponentCustomProperties {
        $usecases: ReturnType<typeof makeUseCasesClient>;
        $queries: Queries;
        $storageRepository: StorageSupabaseRepository;
        $authRepository: AuthRepository;
    }
}

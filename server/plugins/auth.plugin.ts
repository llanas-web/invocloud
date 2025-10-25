import { serverSupabaseServiceRole } from "#supabase/server";
import AuthSupabaseRepository from "~~/shared/infra/common/supabase/auth.supabase.repository";
import { Database } from "~~/shared/infra/common/supabase/database.types";
import { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("request", (event) => {
        const supabaseClient = serverSupabaseServiceRole<Database>(event);
        const authRepository = new AuthSupabaseRepository(supabaseClient);

        (event as any).authRepository = authRepository;
    });
});

// helper d’accès
export function useServerAuthRepository(event: any) {
    return (event as any).authRepository as AuthRepository;
}

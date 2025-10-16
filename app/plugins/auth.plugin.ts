import AuthFactory from "~~/shared/providers/auth/auth.factory";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";

export default defineNuxtPlugin((nuxtApp) => {
    const supabaseClient = useSupabaseClient<Database>();
    const authProvider = AuthFactory.getInstance(supabaseClient);

    nuxtApp.provide("authFactory", authProvider);
});

import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";

export default defineNuxtPlugin((nuxtApp) => {
    const supabaseClient = useSupabaseClient<Database>();
    const databaseFactory = DatabaseFactory.getInstance(supabaseClient);

    nuxtApp.provide("databaseFactory", databaseFactory);
});

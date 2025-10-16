import StorageFactory from "~~/shared/providers/storage/storage.factory";
import type { Database } from "~~/types/providers/database/supabase/database.types";

export default defineNuxtPlugin((nuxtApp) => {
    const supabaseClient = useSupabaseClient<Database>();
    const storageFactory = StorageFactory.getInstance(supabaseClient);

    nuxtApp.provide("storageFactory", storageFactory);
});

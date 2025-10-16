import type { StorageProvider } from "./storage.interface";
import { StorageSupabaseRepository } from "./supabase/repositories/storage.repository";
import type { SupabaseClient } from "@supabase/supabase-js";

class StorageFactory {
    private static instance: StorageProvider;

    private constructor(client: SupabaseClient) {
        StorageFactory.instance = new StorageSupabaseRepository(client);
    }

    public static getInstance(client: SupabaseClient): StorageProvider {
        if (!StorageFactory.instance) {
            new StorageFactory(client);
        }
        return StorageFactory.instance;
    }
}

export default StorageFactory;

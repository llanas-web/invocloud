import StorageSupabaseRepository from "~~/shared/infra/common/supabase/storage.supabase.repository";
import type { StorageRepository } from "./storage.repository";
import type { SupabaseClient } from "@supabase/supabase-js";

class StorageFactory {
    private static instance: StorageRepository;

    private constructor(client: SupabaseClient) {
        StorageFactory.instance = new StorageSupabaseRepository(client);
    }

    public static getInstance(client: SupabaseClient): StorageRepository {
        if (!StorageFactory.instance) {
            new StorageFactory(client);
        }
        return StorageFactory.instance;
    }
}

export default StorageFactory;

import type { AuthInterface } from "../auth/auth.interface";
import SupabaseAuthRepository from "../auth/supabase/auth.repository";
import type {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "./database.interface";
import {
    AdminSupabaseRepository,
    EstablishmentSupabaseRepository,
    InvoiceSupabaseRepository,
    SupplierSupabaseRepository,
    UploadValidationSupabaseRepository,
    UserSupabaseRepository,
} from "./supabase/repositories";
import type { SupabaseClient } from "@supabase/supabase-js";

// Typage des repositories
type RepositoryMap = {
    establishmentRepository: EstablishmentRepository;
    invoiceRepository: InvoiceRepository;
    supplierRepository: SupplierRepository;
    userRepository: UserRepository;
    uploadValidationRepository: UploadValidationRepository;
    authRepository: AuthInterface;
    adminRepository: AdminRepository;
};

class DatabaseFactory {
    private static instance: DatabaseFactory;
    private repositories: Partial<RepositoryMap> = {};

    private constructor(client: SupabaseClient) {
        this.repositories.establishmentRepository =
            new EstablishmentSupabaseRepository(
                client,
            );
        this.repositories.invoiceRepository = new InvoiceSupabaseRepository(
            client,
        );
        this.repositories.supplierRepository = new SupplierSupabaseRepository(
            client,
        );
        this.repositories.userRepository = new UserSupabaseRepository(client);
        this.repositories.uploadValidationRepository =
            new UploadValidationSupabaseRepository(client);
        this.repositories.authRepository = new SupabaseAuthRepository(client);
        this.repositories.adminRepository = new AdminSupabaseRepository(client);
    }

    public static getInstance(client: SupabaseClient): DatabaseFactory {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new DatabaseFactory(client);
        }
        return DatabaseFactory.instance;
    }

    public getRepository<K extends keyof RepositoryMap>(
        repositoryName: K,
    ): RepositoryMap[K] {
        const repo = this.repositories[repositoryName];
        if (!repo) {
            throw new Error(`Repository ${repositoryName} not found`);
        }
        return repo;
    }
}

export default DatabaseFactory;

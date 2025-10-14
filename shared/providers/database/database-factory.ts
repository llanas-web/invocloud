import type { AuthInterface } from "../auth/auth.interface";
import SupabaseAuthRepository from "../auth/supabase/auth.repository";
import type {
    AdminInterface,
    EstablishmentsInterface,
    InvoicesInterface,
    SuppliersInterface,
    UploadValidationsInterface,
    UserInterface,
} from "./database.interface";
import {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "./supabase/repositories";
import type { SupabaseClient } from "@supabase/supabase-js";

// Typage des repositories
type RepositoryMap = {
    establishmentRepository: EstablishmentsInterface;
    invoiceRepository: InvoicesInterface;
    supplierRepository: SuppliersInterface;
    userRepository: UserInterface;
    uploadValidationRepository: UploadValidationsInterface;
    authRepository: AuthInterface;
    adminRepository: AdminInterface;
};

class DatabaseFactory {
    private static instance: DatabaseFactory;
    private repositories: Partial<RepositoryMap> = {};

    private constructor(client: SupabaseClient) {
        this.repositories.establishmentRepository = new EstablishmentRepository(
            client,
        );
        this.repositories.invoiceRepository = new InvoiceRepository(client);
        this.repositories.supplierRepository = new SupplierRepository(client);
        this.repositories.userRepository = new UserRepository(client);
        this.repositories.uploadValidationRepository =
            new UploadValidationRepository(client);
        this.repositories.authRepository = new SupabaseAuthRepository(client);
        this.repositories.adminRepository = new AdminRepository(client);
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

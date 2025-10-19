import type { AuthInterface } from "../auth/auth.interface";
import SupabaseAuthRepository from "../auth/supabase/auth.repository";
import type {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    InvoiceTaskRepository,
    SubscriptionRepository,
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
import { InvoiceTaskSupabaseRepository } from "./supabase/repositories/invoice-task.repository";
import { SubscriptionSupabaseRepository } from "./supabase/repositories/subscription.repository";

// Typage des repositories
type RepositoryMap = {};

class DatabaseFactory {
    private static instance: DatabaseFactory;

    public establishmentRepository: EstablishmentRepository;
    public invoiceRepository: InvoiceRepository;
    public supplierRepository: SupplierRepository;
    public userRepository: UserRepository;
    public uploadValidationRepository: UploadValidationRepository;
    public authRepository: AuthInterface;
    public adminRepository: AdminRepository;
    public invoiceTaskRepository: InvoiceTaskRepository;
    public subscriptionRepository: SubscriptionRepository;

    private constructor(client: SupabaseClient) {
        this.establishmentRepository = new EstablishmentSupabaseRepository(
            client,
        );
        this.invoiceRepository = new InvoiceSupabaseRepository(
            client,
        );
        this.supplierRepository = new SupplierSupabaseRepository(
            client,
        );
        this.userRepository = new UserSupabaseRepository(client);
        this.uploadValidationRepository =
            new UploadValidationSupabaseRepository(client);
        this.authRepository = new SupabaseAuthRepository(client);
        this.adminRepository = new AdminSupabaseRepository(client);
        this.invoiceTaskRepository = new InvoiceTaskSupabaseRepository(client);
        this.subscriptionRepository = new SubscriptionSupabaseRepository(
            client,
        );
    }

    public static getInstance(client: SupabaseClient): DatabaseFactory {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new DatabaseFactory(client);
        }
        return DatabaseFactory.instance;
    }
}

export default DatabaseFactory;

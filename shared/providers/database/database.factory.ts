import type { AuthInterface } from "../auth/auth.interface";
import SupabaseAuthRepository from "../auth/supabase/auth.repository";
import type {
    AdminRepository,
    InvoiceTaskRepository,
    UploadValidationRepository,
    UserRepository,
} from "./database.interface";
import {
    AdminSupabaseRepository,
    UploadValidationSupabaseRepository,
    UserSupabaseRepository,
} from "./supabase/repositories";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InvoiceTaskSupabaseRepository } from "./supabase/repositories/invoice-task.repository";

// Typage des repositories
type RepositoryMap = {};

class DatabaseFactory {
    private static instance: DatabaseFactory;

    public userRepository: UserRepository;
    public uploadValidationRepository: UploadValidationRepository;
    public authRepository: AuthInterface;
    public adminRepository: AdminRepository;
    public invoiceTaskRepository: InvoiceTaskRepository;

    private constructor(client: SupabaseClient) {
        this.userRepository = new UserSupabaseRepository(client);
        this.uploadValidationRepository =
            new UploadValidationSupabaseRepository(client);
        this.authRepository = new SupabaseAuthRepository(client);
        this.adminRepository = new AdminSupabaseRepository(client);
        this.invoiceTaskRepository = new InvoiceTaskSupabaseRepository(client);
    }

    public static getInstance(client: SupabaseClient): DatabaseFactory {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new DatabaseFactory(client);
        }
        return DatabaseFactory.instance;
    }
}

export default DatabaseFactory;

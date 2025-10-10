import {
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "~~/shared/providers/database/supabase/repositories";
import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import { AdminInterface } from "~~/shared/providers/database/database.interface";

export type Deps = {
    repos: {
        establishmentRepository: EstablishmentRepository;
        invoiceRepository: InvoiceRepository;
        supplierRepository: SupplierRepository;
        userRepository: UserRepository;
        uploadValidationRepository: UploadValidationRepository;
        authRepository: AuthInterface;
        adminRepository: AdminInterface;
    };
};

export type RequestContext = {
    requestId: string;
    userId: string;
    ip?: string;
    now: () => Date;
};

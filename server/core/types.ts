import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "~~/shared/providers/database/database.interface";

export type Deps = {
    repos: {
        establishmentRepository: EstablishmentRepository;
        invoiceRepository: InvoiceRepository;
        supplierRepository: SupplierRepository;
        userRepository: UserRepository;
        uploadValidationRepository: UploadValidationRepository;
        authRepository: AuthInterface;
        adminRepository: AdminRepository;
    };
};

export type RequestContext = {
    requestId: string;
    userId: string;
    ip?: string;
    now: () => Date;
};

import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import {
    AdminRepository,
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "~~/shared/providers/database/database.interface";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import type { OcrProvider } from "~~/shared/providers/ocr/ocr.interface";
import type { EmailProviderInterface } from "~~/shared/providers/email/email.interface";

export type Deps = {
    storage: StorageProvider;
    auth: AuthInterface;
    ocr: OcrProvider;
    email: EmailProviderInterface;
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

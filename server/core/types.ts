import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import {
    AdminInterface,
    EstablishmentsInterface,
    InvoicesInterface,
    SuppliersInterface,
    UploadValidationsInterface,
    UserInterface,
} from "~~/shared/providers/database/database.interface";

export type Deps = {
    repos: {
        establishmentRepository: EstablishmentsInterface;
        invoiceRepository: InvoicesInterface;
        supplierRepository: SuppliersInterface;
        userRepository: UserInterface;
        uploadValidationRepository: UploadValidationsInterface;
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

import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import {
    DatabaseInterface,
} from "~~/shared/providers/database/database.interface";
import type { StorageProvider } from "~~/shared/application/common/providers/storage/storage.repository";
import type { OcrProvider } from "~~/shared/providers/ocr/ocr.interface";
import type { EmailRepository } from "~~/shared/application/common/providers/email/email.repository";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";

export type Deps = {
    storage: StorageProvider;
    auth: AuthInterface;
    ocr: OcrProvider;
    email: EmailRepository;
    payment: PaymentRepository;
    database: DatabaseInterface;
};

export type RequestContext = {
    requestId: string;
    userId: string;
    ip?: string;
    now: () => Date;
    authentProtection: (allowAnonyme?: boolean) => void;
};

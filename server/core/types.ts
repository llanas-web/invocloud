import type { AuthInterface } from "~~/shared/providers/auth/auth.interface";
import {
    DatabaseInterface,
} from "~~/shared/providers/database/database.interface";
import type { StorageProvider } from "~~/shared/providers/storage/storage.interface";
import type { OcrProvider } from "~~/shared/providers/ocr/ocr.interface";
import type { EmailProviderInterface } from "~~/shared/providers/email/email.interface";
import type { PaymentProviderInterface } from "~~/shared/providers/payment/payment.interface";

export type Deps = {
    storage: StorageProvider;
    auth: AuthInterface;
    ocr: OcrProvider;
    email: EmailProviderInterface;
    payment: PaymentProviderInterface;
    database: DatabaseInterface;
};

export type RequestContext = {
    requestId: string;
    userId: string;
    ip?: string;
    now: () => Date;
    authentProtection: (allowAnonyme?: boolean) => void;
};

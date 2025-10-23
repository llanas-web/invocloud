import type UserSettingsModel from "~~/shared/types/models/user-settings.model";
import type {
    UserModel,
    UserModelUpdate,
} from "~~/shared/types/models/user.model";
import type {
    InvoiceTaskUpdate,
    UploadValidation,
    UploadValidationUpdate,
    UserSettingsUpdate,
} from "#shared/types/providers/database/index";
import type {
    InvoiceTaskModel,
    InvoiceTaskStatus,
} from "~~/shared/types/models/invoice-task.model";

type EncapsulatedResult<T> = Promise<T>;

export interface UploadValidationRepository {
    createUploadValidation(
        senderEmail: string,
        recipientEmail: string,
        hashToken: string,
        uploaderId?: string,
        establishementsIds?: string[],
    ): EncapsulatedResult<string>;
    getUploadValidation(
        uploadValidation: string,
        hashToken: string,
        uploaderId: string,
    ): EncapsulatedResult<UploadValidation>;
    isTokenValid(
        uploadValidationId: string,
        uploaderId: string,
        hashToken: string,
    ): EncapsulatedResult<boolean>;
    updateUploadValidation(
        uploadValidationId: string,
        updates: UploadValidationUpdate,
    ): Promise<void>;
}

export interface UserRepository {
    getUser(
        filter?: { id?: string; email?: string },
    ): EncapsulatedResult<UserModel>;
    updateUser(
        id: string,
        updates: UserModelUpdate,
    ): EncapsulatedResult<UserModel>;
    deleteUser(id: string): Promise<void>;
    getUserSettings(
        userId: string,
    ): EncapsulatedResult<UserSettingsModel>;
    upsertUserSettings(
        userId: string,
        settings: UserSettingsUpdate,
    ): EncapsulatedResult<UserSettingsModel>;
}

export interface AdminRepository {
    inviteUserByEmail(
        email: string,
        data: object,
        redirectTo: string,
    ): EncapsulatedResult<boolean>;
}

export interface InvoiceTaskRepository {
    getInvoiceTasks(
        status: InvoiceTaskStatus,
        maxAttempts?: number,
        options?: { limit?: number },
    ): Promise<InvoiceTaskModel[]>;

    updateInvoiceTask(
        id: string,
        updates: InvoiceTaskUpdate,
        idType?: "id" | "job_id",
    ): Promise<InvoiceTaskModel>;
}

export interface DatabaseInterface {
    uploadValidationRepository: UploadValidationRepository;
    userRepository: UserRepository;
    adminRepository: AdminRepository;
    invoiceTaskRepository: InvoiceTaskRepository;
}

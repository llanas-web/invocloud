import type {
    EstablishmentModel,
    EstablishmentModelInsert,
    EstablishmentModelUpdate,
    EstablishmentShortModel,
} from "#shared/models/establishment.model";
import type { InvoiceModel } from "~~/shared/models/invoice.model";
import type { MemberModel } from "~~/shared/models/member.model";
import type SupplierModel from "~~/shared/models/supplier.model";
import type UserSettingsModel from "~~/shared/models/user-settings.model";
import type { UserModel } from "~~/shared/models/user.model";
import type {
    InvoiceInsert,
    InvoiceUpdate,
    SupplierInsert,
    SupplierUpdate,
    UploadValidationUpdate,
    UserSettingsUpdate,
    UserUpdate,
} from "~~/types/providers/database/index";
import type { SupabaseError } from "./supabase/supabase-error";
import type { DomainError } from "~~/shared/errors/domain.error";
import type { Result } from "./result";

type EncapsulatedResult<T> = Promise<Result<T, SupabaseError | DomainError>>;

export interface EstablishmentRepository {
    getAllEstablishments(
        filters: {
            ids?: string[];
            prefixEmails?: string[];
        },
    ): EncapsulatedResult<EstablishmentModel[]>;
    getEstablishmentsShortFromUploadId(
        uploadId: string,
        userId: string,
    ): EncapsulatedResult<EstablishmentShortModel[]>;
    getEstablishmentsFromMemberId(
        userId: string,
    ): EncapsulatedResult<EstablishmentModel[]>;
    isEmailPrefixAvailable(
        emailPrefix: string,
        excludeEstablishmentId?: string,
    ): EncapsulatedResult<boolean>;
    createEstablishment(
        establishment: EstablishmentModelInsert,
    ): EncapsulatedResult<EstablishmentModel>;
    updateEstablishment(
        id: string,
        establishment: EstablishmentModelUpdate,
    ): EncapsulatedResult<EstablishmentModel>;
    getEstablishmentsShortFromEmails(
        emailSender: string,
        recipientEmail: string,
    ): EncapsulatedResult<EstablishmentShortModel[]>;
    deleteEstablishment(id: string): EncapsulatedResult<boolean>;
    getEstablishmentMembers(
        establishmentId: string,
    ): EncapsulatedResult<MemberModel[]>;
    addEstablishmentMember(
        establishmentId: string,
        userId: string,
    ): EncapsulatedResult<MemberModel>;
    removeEstablishmentMember(
        establishmentId: string,
        userId: string,
    ): EncapsulatedResult<boolean>;
}

export interface InvoiceRepository {
    getAllInvoices(
        filters?: {
            ids?: string[];
            establishmentIds?: string[];
        },
    ): EncapsulatedResult<InvoiceModel[] | null>;
    createInvoice(
        invoices: InvoiceInsert[],
    ): EncapsulatedResult<InvoiceModel[] | null>;
    updateInvoice(
        invoiceId: string,
        invoice: InvoiceUpdate,
    ): EncapsulatedResult<InvoiceModel | null>;
    deleteInvoices(invoiceIds: string[]): EncapsulatedResult<boolean>;
}

export interface SupplierRepository {
    getAllSuppliers(
        filters?: { establishmentIds: string[]; emails: string[] },
    ): EncapsulatedResult<SupplierModel[]>;
    createSupplier(
        supplier: SupplierInsert,
    ): EncapsulatedResult<SupplierModel>;
    updateSupplier(
        supplierId: string,
        updatedSupplier: SupplierUpdate,
    ): EncapsulatedResult<SupplierModel>;
    deleteSupplier(supplierId: string): EncapsulatedResult<boolean>;
}

export interface UploadValidationRepository {
    createUploadValidation(
        senderEmail: string,
        recipientEmail: string,
        token: string,
        uploaderId?: string,
    ): EncapsulatedResult<string>;
    isTokenValid(
        uploadValidationId: string,
        uploaderId: string,
        token: string,
    ): EncapsulatedResult<boolean>;
    updateUploadValidation(
        uploadValidationId: string,
        updates: UploadValidationUpdate,
    ): EncapsulatedResult<boolean>;
}

export interface UserRepository {
    getUser(
        filter?: { id?: string; email?: string },
    ): EncapsulatedResult<UserModel | null>;
    updateUser(
        id: string,
        updates: UserUpdate,
    ): EncapsulatedResult<UserModel>;
    deleteUser(id: string): EncapsulatedResult<boolean>;
    getUserSettings(
        userId: string,
    ): EncapsulatedResult<UserSettingsModel | null>;
    upsertUserSettings(
        userId: string,
        settings: UserSettingsUpdate,
    ): EncapsulatedResult<UserSettingsModel | null>;
}

export interface AdminRepository {
    inviteUserByEmail(
        email: string,
        data: object,
        redirectTo: string,
    ): EncapsulatedResult<boolean>;
}

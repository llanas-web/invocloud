import type {
    EstablishmentModel,
    EstablishmentModelInsert,
    EstablishmentModelUpdate,
    EstablishmentShortModel,
} from "~~/shared/types/models/establishment.model";
import type {
    InvoiceModel,
    InvoiceModelUpdate,
} from "~~/shared/types/models/invoice.model";
import type { MemberModel } from "~~/shared/types/models/member.model";
import type SupplierModel from "~~/shared/types/models/supplier.model";
import type UserSettingsModel from "~~/shared/types/models/user-settings.model";
import type {
    UserModel,
    UserModelUpdate,
} from "~~/shared/types/models/user.model";
import type {
    InvoiceInsert,
    SupplierInsert,
    SupplierUpdate,
    UploadValidationUpdate,
    UserSettingsUpdate,
} from "#shared/types/providers/database/index";

type EncapsulatedResult<T> = Promise<T>;

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
    ): EncapsulatedResult<InvoiceModel[]>;
    createInvoice(
        invoices: InvoiceInsert[],
    ): EncapsulatedResult<InvoiceModel[]>;
    updateInvoice(
        invoiceId: string,
        invoice: InvoiceModelUpdate,
    ): EncapsulatedResult<InvoiceModel>;
    deleteInvoices(invoiceIds: string[]): EncapsulatedResult<boolean>;
}

export interface SupplierRepository {
    getAllSuppliers(
        filters?: { establishmentIds?: string[]; emails?: string[] },
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
    ): EncapsulatedResult<UserModel>;
    updateUser(
        id: string,
        updates: UserModelUpdate,
    ): EncapsulatedResult<UserModel>;
    deleteUser(id: string): EncapsulatedResult<boolean>;
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

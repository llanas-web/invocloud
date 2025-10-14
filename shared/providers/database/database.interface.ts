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

export interface EstablishmentsInterface {
    getAllEstablishments(
        filters: {
            ids?: string[];
            prefixEmails?: string[];
        },
    ): Promise<EstablishmentModel[]>;
    getEstablishmentsShortFromUploadId(
        uploadId: string,
        userId: string,
    ): Promise<EstablishmentShortModel[]>;
    getEstablishmentsFromMemberId(
        userId: string,
    ): Promise<EstablishmentModel[]>;
    isEmailPrefixAvailable(
        emailPrefix: string,
    ): Promise<boolean>;
    createEstablishment(
        establishment: EstablishmentModelInsert,
    ): Promise<EstablishmentModel | null>;
    updateEstablishment(
        id: string,
        establishment: EstablishmentModelUpdate,
    ): Promise<EstablishmentModel | null>;
    getEstablishmentsShortFromEmails(
        emailSender: string,
        recipientEmail: string,
    ): Promise<EstablishmentShortModel[]>;
    deleteEstablishment(id: string): Promise<boolean>;
    getEstablishmentMembers(
        establishmentId: string,
    ): Promise<MemberModel[]>;
    addEstablishmentMember(
        establishmentId: string,
        userId: string,
    ): Promise<MemberModel>;
    removeEstablishmentMember(
        establishmentId: string,
        userId: string,
    ): Promise<boolean>;
}

export interface InvoicesInterface {
    getAllInvoices(
        filters?: {
            ids?: string[];
            establishmentIds?: string[];
        },
    ): Promise<InvoiceModel[] | null>;
    createInvoice(
        invoices: InvoiceInsert[],
    ): Promise<InvoiceModel[] | null>;
    updateInvoice(
        invoiceId: string,
        invoice: InvoiceUpdate,
    ): Promise<InvoiceModel | null>;
    deleteInvoices(invoiceIds: string[]): Promise<boolean>;
}

export interface SuppliersInterface {
    getAllSuppliers(
        filters?: { establishmentIds: string[]; emails: string[] },
    ): Promise<SupplierModel[]>;
    createSupplier(
        supplier: SupplierInsert,
    ): Promise<SupplierModel>;
    updateSupplier(
        supplierId: string,
        updatedSupplier: SupplierUpdate,
    ): Promise<SupplierModel>;
    deleteSupplier(supplierId: string): Promise<boolean>;
}

export interface UploadValidationsInterface {
    createUploadValidation(
        senderEmail: string,
        recipientEmail: string,
        token: string,
        uploaderId?: string,
    ): Promise<string>;
    isTokenValid(
        uploadValidationId: string,
        uploaderId: string,
        token: string,
    ): Promise<boolean>;
    updateUploadValidation(
        uploadValidationId: string,
        updates: UploadValidationUpdate,
    ): Promise<boolean>;
}

export interface UserInterface {
    getUser(
        filter?: { id?: string; email?: string },
    ): Promise<UserModel | null>;
    updateUser(
        id: string,
        updates: UserUpdate,
    ): Promise<UserModel>;
    deleteUser(id: string): Promise<boolean>;
    getUserSettings(
        userId: string,
    ): Promise<UserSettingsModel | null>;
    upsertUserSettings(
        userId: string,
        settings: UserSettingsUpdate,
    ): Promise<UserSettingsModel | null>;
}

export interface AdminInterface {
    inviteUserByEmail(
        email: string,
        data: object,
        redirectTo: string,
    ): Promise<boolean>;
}

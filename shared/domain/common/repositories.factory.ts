import type { EstablishmentRepository } from "../establishment/establishment.repository";
import type { GuestUploadSessionRepository } from "../guest-upload/guest-upload-session.repository";
import type { InvoiceTaskRepository } from "../invoice-task/invoice-task.repository";
import type { InvoiceRepository } from "../invoice/invoice.repository";
import type { SupplierRepository } from "../supplier/supplier.repository";
import type { UserRepository } from "../user/user.repository";

export interface Repositories {
    invoicesRepo: InvoiceRepository;
    establishmentsRepo: EstablishmentRepository;
    suppliersRepo: SupplierRepository;
    userRepo: UserRepository;
    guestUploadSessionsRepo: GuestUploadSessionRepository;
    invoiceTasksRepo: InvoiceTaskRepository;
}

export interface RepositoriesFactory {
    readonly repositories: Repositories;
}

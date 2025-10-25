import type { EstablishmentRepository } from "../establishment/establishment.repository";
import type { GuestUploadSessionRepository } from "../guest-upload/guest-upload-session.repository";
import type { InvoiceTaskRepository } from "../invoice-task/invoice-task.repository";
import type { InvoiceRepository } from "../invoice/invoice.repository";
import type { SupplierRepository } from "../supplier/supplier.repository";
import type { UserRepository } from "../user/user.repository";

export interface RepositoriesFactory {
    invoices(): InvoiceRepository;
    establishments(): EstablishmentRepository;
    suppliers(): SupplierRepository;
    users(): UserRepository;
    guestUploadSessions(): GuestUploadSessionRepository;
    invoiceTasks(): InvoiceTaskRepository;
}

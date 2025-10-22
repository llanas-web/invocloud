import type { EstablishmentRepository } from "../establishment/establishment.repository";
import type { InvoiceRepository } from "../invoice/invoice.repository";
import type { SupplierRepository } from "../supplier/supplier.repository";

export interface RepositoryFactory {
    invoices(): InvoiceRepository;
    establishments(): EstablishmentRepository;
    suppliers(): SupplierRepository;
}

import type { EstablishmentRepository } from "../establishment/establishment.repository";
import type { InvoiceRepository } from "../invoice/invoice.repository";

export interface RepositoryFactory {
    invoices(): InvoiceRepository;
    establishments(): EstablishmentRepository;
}

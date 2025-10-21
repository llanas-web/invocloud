import type { InvoiceRepository } from "../invoice/invoice.repository";

export interface RepositoryFactory {
    invoices(): InvoiceRepository;
}

import type {
    InvoiceSource,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";

// DTO de lecture (optimisé pour l'affichage)
export type InvoiceListItemDTO = {
    id: string;
    supplierId: string;
    supplierName: string; // 🔥 Join avec suppliers
    status: InvoiceStatus;
    source: InvoiceSource;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;

    // Champs optionnels
    name: string | null;
    number: string | null;
    amount: number | null;
    emitDate: Date | null;
    dueDate: Date | null;
    paidAt: Date | null;
    comment: string | null;
};

// Filtres (réutilisez celui du domain si vous en avez un)
export type InvoiceListFilter = {
    ids?: string[];
    supplierIds?: string[];
    establishmentIds?: string[];
    status?: InvoiceStatus[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
};

// Interface de lecture (pas de dépendance à Supabase)
export interface InvoiceListQuery {
    execute(filters?: InvoiceListFilter): Promise<InvoiceListItemDTO[]>;
}

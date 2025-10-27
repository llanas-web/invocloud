export type SupplierListItemDTO = SupplierDetailsDTO;

export type SupplierDetailsDTO = {
    id: string;
    name: string;
    emails: string[];
    phone?: string | null;
};

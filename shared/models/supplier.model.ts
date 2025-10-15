export default class SupplierModel {
    id: string;
    createdAt: Date;
    name: string;
    emails: string[];
    phone: string | null;
    updatedAt: Date;
    establishmentId: string;

    constructor({
        id,
        createdAt,
        name,
        emails,
        phone,
        updatedAt,
        establishmentId,
    }: {
        id: string;
        createdAt: Date;
        name: string;
        emails: string[];
        phone: string | null;
        updatedAt: Date;
        establishmentId: string;
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.emails = emails;
        this.phone = phone;
        this.updatedAt = updatedAt;
        this.establishmentId = establishmentId;
    }
}

export type SupplierModelUpdate = Partial<
    Omit<SupplierModel, "id" | "createdAt" | "establishmentId" | "updatedAt">
>;
export type SupplierModelInsert =
    & Omit<SupplierModel, "id" | "createdAt" | "updatedAt">
    & { id?: string };

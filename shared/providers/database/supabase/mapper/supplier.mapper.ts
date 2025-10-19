import SupplierModel from "~~/shared/types/models/supplier.model";
import type { Supplier } from "~~/shared/types/providers/database";

export const supplierMapperFromDatabase = (data: Supplier): SupplierModel => {
    return new SupplierModel({
        id: data.id,
        createdAt: new Date(data.created_at),
        name: data.name,
        emails: data.emails,
        phone: data.phone,
        updatedAt: new Date(data.updated_at),
        establishmentId: data.establishment_id,
    });
};

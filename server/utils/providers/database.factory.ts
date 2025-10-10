import {
    EstablishmentsInterface,
    InvoicesInterface,
    SuppliersInterface,
    UploadValidationsInterface,
    UserInterface,
} from "#shared/providers/database/database.interface";
import type { H3Event } from "h3";
import {
    EstablishmentRepository,
    InvoiceRepository,
    SupplierRepository,
    UploadValidationRepository,
    UserRepository,
} from "#shared/providers/database/supabase/repositories";
import { serverClient } from "#shared/providers/database/supabase/client";

export let databaseClient: any = null; // Replace 'any' with your actual database client type
export let establishmentRepository: EstablishmentsInterface | null = null;
export let invoiceRepository: InvoicesInterface | null = null;
export let supplierRepository: SuppliersInterface | null = null;
export let uploadValidationRepository: UploadValidationsInterface | null = null;
export let userRepository: UserInterface | null = null;

export const databaseFactory = (event: H3Event) => {
    if (import.meta.server) {
        if (!databaseClient) {
            databaseClient = serverClient(event);
        }
        establishmentRepository = new EstablishmentRepository(databaseClient);
        invoiceRepository = new InvoiceRepository(databaseClient);
        supplierRepository = new SupplierRepository(databaseClient);
        uploadValidationRepository = new UploadValidationRepository(
            databaseClient,
        );
        userRepository = new UserRepository(databaseClient);
    }
    return {
        establishmentRepository,
        invoiceRepository,
        supplierRepository,
        uploadValidationRepository,
        userRepository,
    };
};

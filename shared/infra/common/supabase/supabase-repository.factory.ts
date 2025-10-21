import type { RepositoryFactory } from "~~/shared/domain/common/repository.factory";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { InvoiceSupabaseRepository } from "../../invoice/supabase/invoice.supabase.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { EstablishmentSupabaseRepository } from "../../establishment/supabase/establishment.supabase.repository";

export class SupabaseRepositoryFactory implements RepositoryFactory {
    constructor(private readonly supabaseInstance: SupabaseClient<Database>) {}

    invoices(): InvoiceRepository {
        return new InvoiceSupabaseRepository(this.supabaseInstance);
    }

    establishments(): EstablishmentRepository {
        return new EstablishmentSupabaseRepository(this.supabaseInstance);
    }
}

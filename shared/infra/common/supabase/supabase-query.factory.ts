import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { InvoiceListQuery } from "~~/shared/application/invoice/queries/invoice-list.query";
import { InvoiceSupabaseQuery } from "~~/shared/infra/invoice/supabase/invoice.supabase.query";
import { EstablishmentSupabaseQuery } from "../../establishment/supabase/establishment.supabase.query";
import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";

export class SupabaseQueryFactory {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    invoiceListQuery(): InvoiceListQuery {
        return new InvoiceSupabaseQuery(this.supabase);
    }

    establishmentQuery(): EstablishmentQuery {
        return new EstablishmentSupabaseQuery(this.supabase);
    }
}

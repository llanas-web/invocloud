import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import type { InvoiceQuery } from "~~/shared/application/invoice/invoice.query";
import { InvoiceSupabaseQuery } from "~~/shared/infra/invoice/supabase/invoice.supabase.query";
import { EstablishmentSupabaseQuery } from "../../establishment/supabase/establishment.supabase.query";
import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";
import { SupplierSupabaseQuery } from "../../supplier/supabase/supplier.supabase.query";
import type { SupplierQuery } from "~~/shared/application/supplier/supplier.query";
import type { QueryFactory } from "../query.factory";
import { UserSupabaseQuery } from "../../user/supabase/user.supabase.query";
import type { UserQuery } from "~~/shared/application/user/user.query";

export class SupabaseQueryFactory implements QueryFactory {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    invoiceListQuery(): InvoiceQuery {
        return new InvoiceSupabaseQuery(this.supabase);
    }

    establishmentQuery(): EstablishmentQuery {
        return new EstablishmentSupabaseQuery(this.supabase);
    }

    suppliersQuery(): SupplierQuery {
        return new SupplierSupabaseQuery(this.supabase);
    }

    userQuery(): UserQuery {
        return new UserSupabaseQuery(this.supabase);
    }
}

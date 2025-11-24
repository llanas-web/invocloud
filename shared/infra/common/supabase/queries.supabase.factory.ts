import type { SupabaseClient } from "@supabase/supabase-js";
import InvoiceSupabaseQuery from "~~/shared/infra/invoice/supabase/invoice.supabase.query";
import EstablishmentSupabaseQuery from "../../establishment/supabase/establishment.supabase.query";
import SupplierSupabaseQuery from "../../supplier/supabase/supplier.supabase.query";
import type {
    Queries,
    QueriesFactory,
} from "../../../domain/common/queries.factory";
import UserSupabaseQuery from "../../user/supabase/user.supabase.query";
import type { Database } from "./database.types";
import { SubscriptionPlanSupabaseQuery } from "../../subscription-plan/subscription-plan.supabase.query";

export class QueriesSupabaseFactory implements QueriesFactory {
    readonly queries: Queries;
    constructor(private readonly supabase: SupabaseClient<Database>) {
        this.queries = {
            invoiceQuery: new InvoiceSupabaseQuery(this.supabase),
            establishmentQuery: new EstablishmentSupabaseQuery(this.supabase),
            suppliersQuery: new SupplierSupabaseQuery(this.supabase),
            userQuery: new UserSupabaseQuery(this.supabase),
            subscriptionPlanQuery: new SubscriptionPlanSupabaseQuery(
                this.supabase,
            ),
        };
    }
}

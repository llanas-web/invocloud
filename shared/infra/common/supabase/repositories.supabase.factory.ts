import type {
    Repositories,
    RepositoriesFactory,
} from "~~/shared/domain/common/repositories.factory";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InvoiceSupabaseRepository } from "../../invoice/supabase/invoice.supabase.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { EstablishmentSupabaseRepository } from "../../establishment/supabase/establishment.supabase.repository";
import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";
import { SupplierSupabaseRepository } from "../../supplier/supabase/supplier.supabase.repository";
import type { UserRepository } from "~~/shared/domain/user/user.repository";
import { UserSupabaseRepository } from "../../user/supabase/user.supabase.repository";
import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import { GuestUploadSessionSupabaseRepository } from "../../guest-upload/supabase/guest-upload-session.supabase.repository";
import type { InvoiceTaskRepository } from "~~/shared/domain/invoice-task/invoice-task.repository";
import { InvoiceTaskSupabaseRepository } from "../../invoice-task/supabase/invoice-task.supabase.repository";
import type { Database } from "./database.types";

export class RepositoriesSupabaseFactory implements RepositoriesFactory {
    readonly repositories: Repositories;

    constructor(private readonly supabaseInstance: SupabaseClient<Database>) {
        this.repositories = {
            invoicesRepo: new InvoiceSupabaseRepository(this.supabaseInstance),
            establishmentsRepo: new EstablishmentSupabaseRepository(
                this.supabaseInstance,
            ),
            suppliersRepo: new SupplierSupabaseRepository(
                this.supabaseInstance,
            ),
            userRepo: new UserSupabaseRepository(this.supabaseInstance),
            guestUploadSessionsRepo: new GuestUploadSessionSupabaseRepository(
                this.supabaseInstance,
            ),
            invoiceTasksRepo: new InvoiceTaskSupabaseRepository(
                this.supabaseInstance,
            ),
        };
    }
}

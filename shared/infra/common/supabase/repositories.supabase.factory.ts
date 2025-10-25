import type { RepositoriesFactory } from "~~/shared/domain/common/repositories.factory";
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
    constructor(private readonly supabaseInstance: SupabaseClient<Database>) {}
    suppliers(): SupplierRepository {
        return new SupplierSupabaseRepository(this.supabaseInstance);
    }

    invoices(): InvoiceRepository {
        return new InvoiceSupabaseRepository(this.supabaseInstance);
    }

    establishments(): EstablishmentRepository {
        return new EstablishmentSupabaseRepository(this.supabaseInstance);
    }

    users(): UserRepository {
        return new UserSupabaseRepository(this.supabaseInstance);
    }

    guestUploadSessions(): GuestUploadSessionRepository {
        return new GuestUploadSessionSupabaseRepository(this.supabaseInstance);
    }

    invoiceTasks(): InvoiceTaskRepository {
        return new InvoiceTaskSupabaseRepository(this.supabaseInstance);
    }
}

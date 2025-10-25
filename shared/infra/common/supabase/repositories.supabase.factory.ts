import type { RepositoriesFactory } from "~~/shared/domain/common/repositories.factory";
import type { InvoiceRepository } from "~~/shared/domain/invoice/invoice.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";
import { InvoiceSupabaseRepository } from "../../invoice/supabase/invoice.supabase.repository";
import type { EstablishmentRepository } from "~~/shared/domain/establishment/establishment.repository";
import { EstablishmentSupabaseRepository } from "../../establishment/supabase/establishment.supabase.repository";
import type { SupplierRepository } from "~~/shared/domain/supplier/supplier.repository";
import { SupplierSupabaseRepository } from "../../supplier/supabase/supplier.supabase.repository";
import type { UserRepository } from "~~/shared/domain/user/user.repository";
import { UserSupabaseRepository } from "../../user/supabase/user.supabase.repository";
import type { GuestUploadSessionRepository } from "~~/shared/domain/guest-upload/guest-upload-session.repository";
import { GuestUploadSessionSupabaseRepository } from "../../guest-upload/guest-upload-session.supabase.repository";

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
}

import type { Database } from "./supabase/database.types";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsInsert =
    Database["public"]["Tables"]["user_settings"]["Insert"];
export type UserSettingsUpdate =
    Database["public"]["Tables"]["user_settings"]["Update"];

export type Establishment =
    Database["public"]["Tables"]["establishments"]["Row"];
export type EstablishmentInsert =
    Database["public"]["Tables"]["establishments"]["Insert"];
export type EstablishmentUpdate =
    Database["public"]["Tables"]["establishments"]["Update"];

export type EstablishmentMember =
    Database["public"]["Tables"]["establishment_members"]["Row"];
export type EstablishmentMemberInsert =
    Database["public"]["Tables"]["establishment_members"]["Insert"];
export type EstablishmentMemberUpdate =
    Database["public"]["Tables"]["establishment_members"]["Update"];

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierInsert =
    Database["public"]["Tables"]["suppliers"]["Insert"];
export type SupplierUpdate =
    Database["public"]["Tables"]["suppliers"]["Update"];

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
export type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];
export type InvoiceStatus = Database["public"]["Enums"]["invoices_status"];

export type InvoiceWithEstablishment =
    Database["public"]["Views"]["invoices_with_establishment"]["Row"];

export type UploadValidation =
    Database["public"]["Tables"]["upload_validations"]["Row"];
export type UploadValidationInsert =
    Database["public"]["Tables"]["upload_validations"]["Insert"];
export type UploadValidationUpdate =
    Database["public"]["Tables"]["upload_validations"]["Update"];

export type InvoiceTask = Database["public"]["Tables"]["invoice_jobs"]["Row"];
export type InvoiceTaskInsert =
    Database["public"]["Tables"]["invoice_jobs"]["Insert"];
export type InvoiceTaskUpdate =
    Database["public"]["Tables"]["invoice_jobs"]["Update"];

export type InvoiceTasksStatus =
    Database["public"]["Enums"]["invoice_job_status"];

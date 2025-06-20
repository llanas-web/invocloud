import type { AvatarProps } from "@nuxt/ui";
import type { Database } from "./database.types";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Establishment =
    Database["public"]["Tables"]["establishments"]["Row"];
export type EstablishmentInsert =
    Database["public"]["Tables"]["establishments"]["Insert"];

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierInsert =
    Database["public"]["Tables"]["suppliers"]["Insert"];

export type SupplierMember =
    Database["public"]["Tables"]["supplier_members"]["Row"];
export type SupplierMemberInsert =
    Database["public"]["Tables"]["supplier_members"]["Insert"];

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
export type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];
export type InvoiceStatus = Database["public"]["Enums"]["invoices_status"];

export type InvoiceWithEstablishment =
    Database["public"]["Views"]["invoices_with_establishment"]["Row"];

export interface Mail {
    id: number;
    unread?: boolean;
    from: User;
    subject: string;
    body: string;
    date: string;
}

export interface Member {
    name: string;
    username: string;
    role: "member" | "owner";
    avatar: Avatar;
}

export interface Stat {
    title: string;
    icon: string;
    value: number | string;
    variation: number;
    formatter?: (value: number) => string;
}

export interface Sale {
    id: string;
    date: string;
    status: SaleStatus;
    email: string;
    amount: number;
}

export interface Notification {
    id: number;
    unread?: boolean;
    sender: User;
    body: string;
    date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
    start: Date;
    end: Date;
}

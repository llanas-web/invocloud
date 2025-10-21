import type {
    InvoiceModel,
    InvoiceStatus,
} from "~~/shared/domain/invoice/invoice.model";
import { ago, fmtCurrency, fmtDate } from "./format";
import type { InvoiceListItemDTO } from "~~/shared/application/invoice/queries/invoice-list.query";

// Map domain status -> UI labels/tokens (colors/icons).
export const statusMeta: Record<
    InvoiceStatus,
    {
        label: string;
        tone: "neutral" | "info" | "warning" | "success" | "danger";
        icon: string;
    }
> = {
    ocr: { label: "OCR", tone: "info", icon: "scan" },
    pending: { label: "À traiter", tone: "warning", icon: "clock" },
    sent: { label: "Envoyée", tone: "info", icon: "send" },
    validated: { label: "Validée", tone: "success", icon: "check-circle" },
    // rejected: { label: "Rejetée", tone: "danger", icon: "ban" },
    paid: { label: "Payée", tone: "success", icon: "banknote" },
    error: { label: "Erreur", tone: "danger", icon: "alert-triangle" },
};

export type InvoiceVM = {
    id: string;
    supplierId: string;
    status: InvoiceModel["status"];
    createdAt: Date;
    updatedAt: Date;
    name: string;
    invoiceNumber: string;
    amount: number | null;
    dueDate: Date | null;
    paidAt: Date | null;
    filePath: string;
    supplierName: string;
    isOverdue: boolean;

    // Derived / formatted
    amountLabel: string;
    dueDateLabel: string;
    dueInLabel: string; // e.g. "dans 3 jours" / "il y a 2 jours"
    createdAtLabel: string;
    statusLabel: string;
    statusTone: "neutral" | "info" | "warning" | "success" | "danger";
    statusIcon: string; // icon name for your UI lib
    overdueBadge: "none" | "danger";
    rowTone?: "muted" | "danger"; // optional row styling helper
};

export function presentInvoice(
    i: InvoiceListItemDTO,
    opts?: { currency?: string; locale?: string },
): InvoiceVM {
    const currency = opts?.currency ?? "EUR";
    const locale = opts?.locale ?? "fr-FR";

    const name = i.name ?? "";
    const invoiceNumber = i.number ?? "";
    const dueDate = i.dueDate ?? null;
    const amount = i.amount ?? null;

    const meta = statusMeta[i.status];

    const isOverdue = !!dueDate && i.status !== "paid" &&
        dueDate.getTime() < Date.now();

    return {
        // raw
        id: i.id,
        supplierId: i.supplierId,
        status: i.status,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        name,
        invoiceNumber,
        amount,
        dueDate,
        paidAt: i.paidAt ?? null,
        filePath: i.filePath,
        supplierName: i.supplierName,
        isOverdue,

        // formatted
        amountLabel: fmtCurrency(amount, currency, locale),
        dueDateLabel: fmtDate(dueDate, locale),
        dueInLabel: ago(dueDate),
        createdAtLabel: fmtDate(i.createdAt, locale),
        statusLabel: meta.label,
        statusTone: meta.tone,
        statusIcon: meta.icon,
        overdueBadge: isOverdue ? "danger" : "none",
        rowTone: isOverdue ? "danger" : undefined,
    };
}

// Batch helper
export const presentInvoices = (
    list: InvoiceListItemDTO[],
    opts?: { currency?: string; locale?: string },
) => list.map((i) => presentInvoice(i, opts));

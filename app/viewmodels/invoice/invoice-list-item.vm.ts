import type { InvoiceListItemDTO } from "~~/shared/application/invoice/dto";
import type { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

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

export class InvoiceListItemViewModel {
    constructor(
        readonly id: string,
        readonly supplierId: string,
        readonly supplierName: string,
        readonly status: InvoiceStatus,
        readonly dueDate: Date | null,
        readonly number: string,
        readonly amount: number | null,
        readonly paidAt: Date | null,
        readonly emitAt: Date | null,
    ) {}

    static fromDTO(dto: InvoiceListItemDTO): InvoiceListItemViewModel {
        return new InvoiceListItemViewModel(
            dto.id,
            dto.supplierId,
            dto.supplierName,
            dto.status,
            dto.dueDate,
            dto.number ?? "",
            dto.amount,
            dto.paidAt,
            dto.emitDate,
        );
    }
}

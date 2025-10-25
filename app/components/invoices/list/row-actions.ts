import type { DropdownMenuItem } from "@nuxt/ui";
import type { InvoiceDetailsDTO } from "~~/shared/application/invoice/dto";

export type RowAction = {
    onSend: (id: string) => void;
    onView: (id: string) => void;
    onUpdateStatus: (id: string, status: "paid" | "error") => Promise<void>;
    onDelete: (id: string) => void;
};

export const createRowActions = (
    invoice: InvoiceDetailsDTO,
    actions: RowAction,
): DropdownMenuItem[] => [
    {
        type: "label",
        label: "Actions",
    },
    {
        label: "Envoyer par e-mail",
        icon: "i-lucide-mail",
        onSelect() {
            actions.onSend(invoice.id);
        },
    },
    {
        type: "separator",
    },
    {
        label: "Voir la facture",
        icon: "i-lucide-eye",
        onSelect() {
            actions.onView(invoice.id);
        },
    },
    {
        type: "separator",
    },
    {
        label: "Changer le statut",
        icon: "i-lucide-pencil",
        children: [
            {
                label: "Marquer comme payé",
                icon: "i-lucide-check",
                iconColor: "success",
                async onSelect() {
                    await actions.onUpdateStatus(invoice.id, "paid");
                },
            },
            {
                label: "Marquer comme en erreur",
                icon: "i-lucide-x",
                async onSelect() {
                    await actions.onUpdateStatus(invoice.id, "error");
                },
            },
        ],
    },
    {
        type: "separator",
    },
    {
        label: "Supprimer facture",
        icon: "i-lucide-trash",
        color: "error",
        onSelect() {
            actions.onDelete(invoice.id);
        },
    },
];

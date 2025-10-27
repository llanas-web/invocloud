import type { TableColumn } from "@nuxt/ui";
import { h } from "vue";
import { NuxtLink, UBadge, UButton, UCheckbox } from "#components";
import type { InvoiceDetailsDTO } from "~~/shared/application/invoice/dto";
import { formatDate } from "~/utils/date";

const statusColors = {
    pending: "warning" as const,
    sent: "error" as const,
    validated: "warning" as const,
    paid: "success" as const,
    error: "error" as const,
};

const statusLabels: Record<string, string> = {
    pending: "En attente",
    sent: "Envoyé",
    validated: "En cours",
    paid: "Payée",
    error: "Erreur",
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(value);
};

export const createInvoiceColumns = (
    onSupplierClick: (supplierId: string) => void,
): TableColumn<InvoiceDetailsDTO>[] => [
    {
        id: "select",
        header: ({ table }) =>
            h(UCheckbox, {
                "modelValue": table.getIsSomePageRowsSelected()
                    ? "indeterminate"
                    : table.getIsAllPageRowsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                    table.toggleAllPageRowsSelected(!!value),
                "ariaLabel": "Select all",
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                "modelValue": row.getIsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                    row.toggleSelected(!!value),
                "ariaLabel": "Select row",
            }),
    },
    {
        accessorKey: "number",
        header: "N°",
        cell: ({ row }) =>
            h(NuxtLink, {
                class: "font-medium text-highlighted hover:underline",
                to: `/app/invoices/${row.original.id}`,
            }, () => row.original.number),
    },
    {
        accessorKey: "supplierName",
        header: "Fournisseur",
        cell: ({ row }) =>
            h(UButton, {
                onClick: () => onSupplierClick(row.original.supplierId),
                variant: "ghost",
            }, () => row.original.supplierName),
    },
    {
        accessorKey: "amount",
        header: () => h("div", { class: "text-right" }, "Montant"),
        cell: ({ row }) =>
            h(
                "div",
                { class: "text-right font-medium" },
                formatCurrency(Number.parseFloat(row.getValue("amount"))),
            ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
            if (
                row.original.status !== "paid" && row.original.dueDate &&
                new Date(row.original.dueDate) < new Date()
            ) {
                return h(UBadge, {
                    class: "capitalize",
                    variant: "subtle",
                    color: "error",
                }, () => "En retard");
            }
            const color =
                statusColors[row.original.status as keyof typeof statusColors];
            return h(UBadge, {
                class: "capitalize",
                variant: "subtle",
                color,
            }, () => statusLabels[row.original.status]);
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                variant: "ghost",
                label: "Date de réception",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () =>
                    column.toggleSorting(column.getIsSorted() === "asc"),
            });
        },
        cell: ({ row }) =>
            h(
                "div",
                { class: "text-muted text-center" },
                formatDate(row.original.emitDate),
            ),
    },
    {
        accessorKey: "dueDate",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                variant: "ghost",
                label: "Date d'échéance",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () =>
                    column.toggleSorting(column.getIsSorted() === "asc"),
            });
        },
        cell: ({ row }) =>
            h(
                "div",
                { class: "text-muted text-center" },
                formatDate(row.original.dueDate),
            ),
    },
    {
        accessorKey: "paidAt",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                variant: "ghost",
                label: "Date de paiement",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () =>
                    column.toggleSorting(column.getIsSorted() === "asc"),
            });
        },
        cell: ({ row }) =>
            h(
                "div",
                { class: "text-muted text-center" },
                formatDate(row.original.paidAt),
            ),
    },
];

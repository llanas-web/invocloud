import { createSharedComposable } from "@vueuse/core";
import { sub } from "date-fns";
import { InvoiceStatus } from "~~/shared/types/models/invoice.model";
import type { Range } from "~~/types";

const ACCEPTED_STATUSES = [
    InvoiceStatus.VALIDATED,
    InvoiceStatus.PAID,
];

const _useInvoicesTableList = () => {
    const { invoices } = useInvoices();

    const acceptedInvoices = computed(() =>
        invoices.value?.filter((i) => ACCEPTED_STATUSES.includes(i.status!)) ||
        []
    );
    const statusFilter = ref<string>("all");
    const rangeFilter = shallowRef<Range>({
        start: sub(new Date(), { months: 1 }),
        end: new Date(),
    });
    const selectedSuppliers = ref<string[]>([]);

    const filteredInvoices = computed(() => {
        return acceptedInvoices.value.filter((invoice) => {
            const matchesStatus = statusFilter.value === "all" ||
                statusFilter.value === "error" && invoice.isOverdue ||
                invoice.status === statusFilter.value;
            const matchesRange = !rangeFilter.value ||
                isDateInRange(
                    new Date(invoice.createdAt),
                    rangeFilter.value.start,
                    rangeFilter.value.end,
                );
            const matchSupplier = selectedSuppliers.value.length === 0 ||
                selectedSuppliers.value.includes(invoice.supplier.id);
            return matchesStatus && matchesRange && matchSupplier;
        });
    });

    return {
        statusFilter,
        rangeFilter,
        selectedSuppliers,
        filteredInvoices,
    };
};

export const useInvoicesTableList = createSharedComposable(
    _useInvoicesTableList,
);

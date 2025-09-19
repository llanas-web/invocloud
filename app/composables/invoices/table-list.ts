import { createSharedComposable } from "@vueuse/core";
import type { Range } from "~~/types";
import { isAfter, isBefore, isEqual, isSameDay, sub } from "date-fns";

const _useInvoicesTableList = () => {
    const { acceptedInvoices } = useInvoices();

    const statusFilter = ref<string>("all");
    const rangeFilter = shallowRef<Range>({
        start: sub(new Date(), { months: 1 }),
        end: new Date(),
    });
    const selectedSuppliers = ref<string[]>([]);

    const filteredInvoices = computed(() => {
        return acceptedInvoices.value.filter((invoice) => {
            const matchesStatus = statusFilter.value === "all" ||
                statusFilter.value === "error" && invoice.overdue ||
                invoice.status === statusFilter.value;
            const matchesRange = !rangeFilter.value ||
                isDateInRange(
                    new Date(invoice.created_at),
                    rangeFilter.value.start,
                    rangeFilter.value.end,
                );
            const matchSupplier = selectedSuppliers.value.length === 0 ||
                selectedSuppliers.value.includes(invoice.supplier_id);
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

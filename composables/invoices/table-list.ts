import { createSharedComposable } from "@vueuse/core";
import type { Range } from "~/types";
import { isAfter, isBefore, sub } from "date-fns";

const _useInvoicesTableList = () => {
    const { acceptedInvoices } = useInvoices();

    const statusFilter = ref<string>("all");
    const rangeFilter = shallowRef<Range>({
        start: sub(new Date(), { months: 1 }),
        end: new Date(),
    });

    const filteredInvoices = computed(() => {
        return acceptedInvoices.value.filter((invoice) => {
            const matchesStatus = statusFilter.value === "all" ||
                invoice.status === statusFilter.value;
            const matchesRange = !rangeFilter.value ||
                isBefore(invoice.created_at, rangeFilter.value.end) &&
                    isAfter(invoice.created_at, rangeFilter.value.start);
            return matchesStatus && matchesRange;
        });
    });

    return {
        statusFilter,
        rangeFilter,
        filteredInvoices,
    };
};

export const useInvoicesTableList = createSharedComposable(
    _useInvoicesTableList,
);

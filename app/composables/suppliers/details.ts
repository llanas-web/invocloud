import { createSharedComposable } from "@vueuse/core";

const _useSupplierDetails = () => {
    const { $queries } = useNuxtApp();

    const selectedId = ref<string | null>(null);

    const { data: dto, pending, refresh } = useAsyncData(
        async () => {
            if (!selectedId.value) {
                throw new Error("No supplier selected.");
            }
            return await $queries.suppliersQuery.getSupplierDetails(
                selectedId.value,
            );
        },
        { immediate: false, watch: [selectedId] },
    );

    const supplier = computed(() => {
        if (!dto.value) return null;
        return {
            id: dto.value.id,
            name: dto.value.name,
            emails: dto.value.emails,
            phone: dto.value.phone,
        };
    });

    return {
        selectedId,
        supplier,
        dto,
        pending,
        refresh,
    };
};

export const useSupplierDetails = createSharedComposable(
    _useSupplierDetails,
);

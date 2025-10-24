import { createSharedComposable } from "@vueuse/core";

const _useSupplierDetails = () => {
    const { $usecases } = useNuxtApp();

    const selectedId = ref<string | null>(null);

    const { data: model, pending, refresh } = useAsyncData(
        async () => {
            if (!selectedId.value) {
                throw new Error("No supplier selected.");
            }
            return await $usecases.suppliers.details.execute(
                selectedId.value,
            );
        },
        { immediate: false, watch: [selectedId] },
    );

    const supplier = computed(() => {
        if (!model.value) return null;
        return {
            id: model.value.id,
            name: model.value.name,
            emails: model.value.emails,
            phone: model.value.phone,
        };
    });

    return {
        selectedId,
        supplier,
        model,
        pending,
        refresh,
    };
};

export const useSupplierDetails = createSharedComposable(
    _useSupplierDetails,
);

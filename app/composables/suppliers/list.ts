import { createSharedComposable } from "@vueuse/core";
import { SupplierListItemViewModel } from "~/viewmodels/supplier/supplier-list-item.vm";

const _useSuppliers = () => {
    const { $usecases } = useNuxtApp();
    const { selectedId } = useEstablishmentsList();

    const { data: dtos, error, refresh, pending } = useAsyncData(
        "suppliers",
        async () => {
            return await $usecases.suppliers.list.execute({
                establishmentIds: [selectedId.value],
            });
        },
        {
            default: () => [],
            lazy: true,
            watch: [selectedId],
        },
    );

    const suppliers = computed(() =>
        dtos.value.map((dto) => SupplierListItemViewModel.fromDTO(dto))
    );

    const deleteSupplierAction = useAsyncAction(
        async (supplierId: string) => {
            await $usecases.suppliers.delete.execute(supplierId);
            await refresh();
        },
    );

    return {
        suppliers,
        refresh,
        pending,
        error,
        actions: {
            delete: deleteSupplierAction,
        },
    };
};

export const useSuppliers = createSharedComposable(_useSuppliers);

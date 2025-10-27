import { createSharedComposable } from "@vueuse/core";

const _useSuppliers = () => {
    const { $usecases, $queries } = useNuxtApp();
    const { selectedId } = useEstablishmentsList();

    const { data: dtos, error, refresh, pending } = useAsyncData(
        "suppliers",
        async () => {
            if (!selectedId.value) return [];
            return await $queries.suppliersQuery.listSuppliers({
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
        dtos.value.map((dto) => ({
            id: dto.id,
            name: dto.name,
            emails: dto.emails,
            phone: dto.phone,
        }))
    );

    const deleteSupplierAction = useAsyncAction(
        async (supplierId: string) => {
            await $usecases.suppliers.delete.execute({
                id: supplierId,
            });
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

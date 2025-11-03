import { createSharedComposable } from "@vueuse/core";
import { AppError } from "~/core/errors/app.error";

const _useSuppliers = () => {
    const { $usecases, $queries } = useNuxtApp();
    const { selectedId } = useEstablishmentsList();

    const { data: dtos, error, refresh, pending } = useAsyncData(
        "suppliers",
        async () => {
            try {
                if (!selectedId.value) return [];
                return await $queries.suppliersQuery.listSuppliers({
                    establishmentIds: [selectedId.value],
                });
            } catch (err) {
                throw AppError.fromUnknownError(err);
            }
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
        {
            successTitle: "Fournisseur supprimé avec succès.",
            errorTitle: "Erreur lors de la suppression du fournisseur.",
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

import { createSharedComposable } from "@vueuse/core";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import type SupplierModel from "~~/shared/types/models/supplier.model";

const _useSuppliers = () => {
    const { $databaseFactory } = useNuxtApp();
    const { supplierRepository } = $databaseFactory as DatabaseFactory;
    const { selectedEstablishment } = useEstablishmentsList();

    const { data: suppliers, error, refresh, pending } = useAsyncData<
        SupplierModel[]
    >(
        "suppliers",
        async () => {
            const suppliers = await supplierRepository
                .getAllSuppliers({
                    establishmentIds: [selectedEstablishment.value!.id],
                });
            return suppliers;
        },
        {
            default: () => [],
            lazy: true,
            watch: [selectedEstablishment],
        },
    );

    return {
        suppliers,
        refresh,
        pending,
        error,
    };
};

export const useSuppliers = createSharedComposable(_useSuppliers);

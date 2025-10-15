import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { Supplier } from "~~/types/providers/database";
import type SupplierModel from "~~/shared/models/supplier.model";

const _useSuppliers = () => {
    const supabase = useSupabaseClient();
    const { getRepository } = DatabaseFactory.getInstance(supabase);
    const supplierRepository = getRepository("supplierRepository");
    const { selectedEstablishment } = useEstablishments();

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

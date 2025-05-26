import { createSharedComposable } from "@vueuse/core";
import type { Supplier, SupplierInsert } from "~/types";

const _useSuppliers = () => {
    const supabaseClient = useSupabaseClient();

    const { data: suppliers, error: suppliersError, refresh, pending } =
        useAsyncData<Supplier[]>(
            "suppliers",
            async () => {
                const { data, error } = await supabaseClient
                    .from("suppliers")
                    .select("*");

                if (error) {
                    console.error("Error fetching suppliers:", error);
                    return [];
                }
                return data;
            },
            {
                immediate: true,
                default: () => [],
            },
        );

    const createSupplier = async ({ email, name }: SupplierInsert) => {
        if (!email || !name) {
            console.error(
                "Email and name are required to create a supplier.",
            );
            return null;
        }
        const { data, error } = await supabaseClient
            .from("suppliers")
            .insert([{
                email,
                name,
            }]).select().single();

        if (error) {
            console.error("Error creating supplier:", error);
            return null;
        }
        await refresh();
        return data;
    };

    const deleteSuppliers = async (supplierIds: string[]) => {
        if (!supplierIds || supplierIds.length === 0) {
            console.error("No supplier IDs provided for deletion.");
            return null;
        }
        const { data, error } = await supabaseClient
            .from("suppliers")
            .delete()
            .in("id", supplierIds);

        if (error) {
            console.error("Error deleting suppliers:", error);
            return null;
        }
        await refresh();
        return data;
    };

    return {
        suppliers,
        refresh,
        pending,
        suppliersError,
        createSupplier,
        deleteSuppliers,
    };
};

export const useSuppliers = createSharedComposable(_useSuppliers);

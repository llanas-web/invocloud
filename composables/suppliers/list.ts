import { createSharedComposable } from "@vueuse/core";
import type { SupplierUpdate } from "~/types";

const _useSuppliers = () => {
    const supabaseClient = useSupabaseClient();
    const { selectedEstablishment } = useEstablishments();

    const { data: suppliers, error: suppliersError, refresh, pending } =
        useAsyncData(
            "suppliers",
            async () => {
                const { data, error } = await supabaseClient
                    .from("suppliers")
                    .select(`
                        *,
                        establishment:establishments (
                            id,
                            name
                        )
                    `).eq(
                        "establishment_id",
                        selectedEstablishment.value!.id,
                    );
                if (error) {
                    console.error("Error fetching suppliers:", error);
                    return [];
                }
                console.log("Fetched suppliers:", data);
                return data;
            },
            {
                default: () => [],
                lazy: true,
                watch: [selectedEstablishment],
            },
        );

    const createSupplier = async (
        name: string,
        emails: string[],
    ) => {
        if (!selectedEstablishment.value) {
            console.error("No establishment selected.");
            return null;
        }
        if (!name || emails.length === 0) {
            console.error(
                "Name and supplier members are required to create a supplier.",
            );
            return null;
        }
        const { data, error } = await supabaseClient
            .from("suppliers")
            .insert([{
                name,
                establishment_id: selectedEstablishment.value!.id,
                emails: emails,
            }]).select().single();

        if (error) {
            console.error("Error creating supplier:", error);
            return null;
        }
        await refresh();
        return data;
    };

    const updateSupplier = async (
        supplierId: string,
        updatedSupplier: SupplierUpdate,
    ) => {
        if (!selectedEstablishment.value) {
            console.error("No establishment selected.");
            return null;
        }
        if (!supplierId || !updatedSupplier) {
            console.error("Supplier ID and updated data are required.");
            return null;
        }
        const { data, error } = await supabaseClient
            .from("suppliers")
            .update(updatedSupplier)
            .eq("id", supplierId)
            .select()
            .single();

        if (error) {
            console.error("Error updating supplier:", error);
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
        updateSupplier,
        deleteSuppliers,
    };
};

export const useSuppliers = createSharedComposable(_useSuppliers);

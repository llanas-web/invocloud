import { createSharedComposable } from "@vueuse/core";
import type {
    Supplier,
    SupplierInsert,
    SupplierMember,
    SupplierMemberInsert,
} from "~/types";

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
                        members:supplier_members (*),
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
                console.log("Fetched suppliers:", data[0].members);
                return data;
            },
            {
                immediate: true,
                default: () => [],
            },
        );

    const createSupplier = async (
        name: string,
        emails: string[],
    ) => {
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
            }]).select().single();

        if (error) {
            console.error("Error creating supplier:", error);
            return null;
        }

        const { error: membersError } = await supabaseClient
            .from("supplier_members")
            .insert(
                emails.map((email) => ({
                    email,
                    supplier_id: data.id,
                })),
            );
        if (membersError) {
            console.error("Error creating supplier members:", membersError);
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

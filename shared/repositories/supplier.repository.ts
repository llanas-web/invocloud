import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupplierInsert } from "~~/types";
import type { Database } from "~~/types/database.types";

const createSupplierRepository = (supabaseClient: SupabaseClient<Database>) => {
    const getSuppliersByEstablishment = async (establishmentId: string) => {
        const { data, error } = await supabaseClient
            .from("suppliers")
            .select(`
                        *,
                        establishment:establishments (
                            id,
                            name
                        )
                    `)
            .eq("establishment_id", establishmentId)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error fetching suppliers:", error);
        }
        return { data, error };
    };

    const getSupplierByEmailAndEstablishmentId = async (
        establishmentId: string,
        email: string,
    ) => {
        const { data, error } = await supabaseClient
            .from("suppliers")
            .select("id")
            .eq("establishment_id", establishmentId)
            .overlaps("emails", [email])
            .maybeSingle();
        if (error) {
            console.error("Error checking email authorization:", error);
        }
        return { data, error };
    };

    const createSupplier = async (supplier: SupplierInsert) => {
        const { data, error } = await supabaseClient
            .from("suppliers")
            .insert([supplier])
            .select()
            .single();

        return { data, error };
    };

    const updateSupplier = async (
        supplierId: string,
        updatedSupplier: Partial<SupplierInsert>,
    ) => {
        const { data, error } = await supabaseClient
            .from("suppliers")
            .update(updatedSupplier)
            .eq("id", supplierId)
            .select()
            .single();

        if (error) {
            console.error("Error updating supplier:", error);
        }

        return { data, error };
    };

    const deleteSuppliers = async (supplierIds: string[]) => {
        const { data, error } = await supabaseClient
            .from("suppliers")
            .delete()
            .in("id", supplierIds);
        if (error) {
            console.error("Error deleting suppliers:", error);
        }
        return { data, error };
    };

    return {
        getSuppliersByEstablishment,
        createSupplier,
        updateSupplier,
        deleteSuppliers,
        getSupplierByEmailAndEstablishmentId,
    };
};

export default createSupplierRepository;

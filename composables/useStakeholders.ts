import { createSharedComposable } from "@vueuse/core";
import type { Stakeholders, StakeholdersInsert } from "~/types";

const _useStakeholders = () => {
    // Generate CRUD Stakeholders with supabase
    const supabaseClient = useSupabaseClient();

    const createStakeholder = async ({ email, name }: StakeholdersInsert) => {
        const { data, error } = await supabaseClient
            .from("stakeholders")
            .insert([{
                email,
                name,
            }]);

        if (error) {
            console.error("Error creating stakeholder:", error);
            return null;
        }

        return data;
    };

    return {
        createStakeholder,
    };
};

export const useStakeholders = createSharedComposable(_useStakeholders);

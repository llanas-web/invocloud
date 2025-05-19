import { createSharedComposable } from "@vueuse/core";
import type { Stakeholder, StakeholderInsert } from "~/types";

const _useStakeholders = () => {
    // Generate CRUD Stakeholders with supabase
    const supabaseClient = useSupabaseClient();

    const stakeholders = ref<Stakeholder[]>([]);
    const stakeholdersLoading = ref(false);

    const getStakeholders = async () => {
        stakeholdersLoading.value = true;
        const { data, error } = await supabaseClient
            .from("stakeholders")
            .select("*");

        if (error) {
            console.error("Error fetching stakeholders:", error);
            return null;
        }
        stakeholders.value = data as Stakeholder[];
        stakeholdersLoading.value = false;
    };

    const createStakeholder = async ({ email, name }: StakeholderInsert) => {
        if (!email || !name) {
            console.error(
                "Email and name are required to create a stakeholder.",
            );
            return null;
        }
        const { data, error } = await supabaseClient
            .from("stakeholders")
            .insert([{
                email,
                name,
            }]).select().single();

        if (error) {
            console.error("Error creating stakeholder:", error);
            return null;
        }
        // Update the local stakeholders array
        stakeholders.value.push(data as Stakeholder);

        return data;
    };

    const deleteStakeholders = async (stakeholderIds: string[]) => {
        if (!stakeholderIds || stakeholderIds.length === 0) {
            console.error("No stakeholder IDs provided for deletion.");
            return null;
        }
        const { data, error } = await supabaseClient
            .from("stakeholders")
            .delete()
            .in("id", stakeholderIds);

        if (error) {
            console.error("Error deleting stakeholders:", error);
            return null;
        }
        // Update the local stakeholders array
        stakeholders.value = stakeholders.value.filter(
            (stakeholder) => !stakeholderIds.includes(stakeholder.id),
        );
        // Optionally, you can refetch the stakeholders to ensure the local state is in sync
        // const { data: updatedData } = await getStakeholders();
        // if (updatedData) {
        //     stakeholders.value = updatedData;
        // }
        // Return the deleted stakeholders

        return data;
    };

    return {
        stakeholders,
        stakeholdersLoading,
        getStakeholders,
        createStakeholder,
        deleteStakeholders,
    };
};

export const useStakeholders = createSharedComposable(_useStakeholders);

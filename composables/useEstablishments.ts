import { createSharedComposable } from "@vueuse/core";
import type { Establishment } from "~/types";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient();
    const user = useSupabaseUser();
    const selectedEstablishment = ref<Establishment | null>(null);

    const { data: establishments, pending, refresh } = useAsyncData(
        "establishments",
        async () => {
            const { data, error } = await supabaseClient
                .from("establishments")
                .select(`*, suppliers (*)`);

            if (error) {
                console.error("Error fetching establishments:", error);
                return [];
            }
            if (data.length === 1) {
                selectedEstablishment.value = data[0] || null;
            }
            return data;
        },
        {
            immediate: true,
            default: () => [],
        },
    );

    const createEstablishment = async (name: string) => {
        const { data: newEstablishment, error } = await supabaseClient
            .from("establishments")
            .insert([{
                name,
                creator_id: user.value!.id,
            }])
            .select().single();

        if (error) {
            console.error("Error creating establishment:", error);
            return null;
        }
        refresh();

        return newEstablishment;
    };

    return {
        establishments,
        selectedEstablishment,
        pending,
        refresh,
        createEstablishment,
    };
};

export const useEstablishments = createSharedComposable(_useEstablishments);

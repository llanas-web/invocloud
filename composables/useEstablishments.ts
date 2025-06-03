import { createSharedComposable } from "@vueuse/core";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient();

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
            return data;
        },
        {
            immediate: true,
            default: () => [],
        },
    );

    const selectedEstablishment = computed(() => {
        return establishments.value[0] || null;
    });

    return {
        establishments,
        selectedEstablishment,
        pending,
        refresh,
    };
};

export const useEstablishments = createSharedComposable(_useEstablishments);

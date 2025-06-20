import { createSharedComposable } from "@vueuse/core";

const _useMembers = () => {
    const supabaseClient = useSupabaseClient();
    const { selectedEstablishment } = useEstablishments();

    const { data: members, error, refresh } = useAsyncData(
        "members",
        async () => {
            const { data, error } = await supabaseClient
                .from("establishment_members")
                .select("*")
                .eq("establishment_id", selectedEstablishment.value!.id);

            if (error) {
                console.error("Error fetching members:", error);
                return [];
            }
            return data;
        },
        {
            default: () => [],
            watch: [selectedEstablishment],
        },
    );

    return {
        members,
        error,
        refresh,
    };
};

export const useMembers = createSharedComposable(_useMembers);

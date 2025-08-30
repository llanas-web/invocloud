import { createSharedComposable } from "@vueuse/core";

const _useMembers = () => {
    const supabaseClient = useSupabaseClient();
    const user = useSupabaseUser();
    const { selectedEstablishment } = useEstablishments();

    const { data: members, error, refresh } = useAsyncData(
        "members",
        async () => {
            const { data, error } = await supabaseClient
                .from("establishment_members")
                .select("*, user:users(*)")
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
            lazy: true,
        },
    );

    const inviteMember = async (email: string) => {
        if (!email) {
            console.error("Email is required to invite a member.");
            return null;
        }
        const { data, error } = await useFetch(
            "/api/members/invite",
            {
                method: "POST",
                body: {
                    email,
                    establishmentId: selectedEstablishment.value!.id,
                    invitorId: user.value!.id,
                },
            },
        );
        if (error.value) {
            console.error("Error inviting member:", error.value);
            return null;
        }
        return data.value;
    };

    return {
        members,
        error,
        refresh,
        inviteMember,
    };
};

export const useMembers = createSharedComposable(_useMembers);

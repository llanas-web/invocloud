import { createSharedComposable } from "@vueuse/core";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";

const _useMembers = () => {
    const supabaseClient = useSupabaseClient();
    const establishmentRepository = createEstablishmentRepository(
        supabaseClient,
    );
    const user = useSupabaseUser();
    const { selectedEstablishment } = useEstablishments();

    const { data: members, error, refresh } = useAsyncData(
        "members",
        async () => {
            const { data, error } = await establishmentRepository
                .getEstablishmentsMembers(selectedEstablishment.value!.id);
            if (error) {
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

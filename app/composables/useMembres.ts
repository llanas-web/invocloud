import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "./core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database-factory";

const _useMembers = () => {
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const establishmentRepository = getRepository("establishmentRepository");
    const user = useSupabaseUser();
    const { selectedEstablishment } = useEstablishments();

    const {
        data: members,
        pending: pendingFetch,
        error: fetchError,
        refresh,
    } = useAsyncData(
        () => `members:${selectedEstablishment.value?.id ?? "anon"}`,
        async () => {
            if (!selectedEstablishment.value?.id) return [];
            const establishmentMembers = await establishmentRepository
                .getEstablishmentMembers(
                    selectedEstablishment.value.id,
                );
            return establishmentMembers;
        },
        {
            default: () => [],
            watch: [selectedEstablishment],
            lazy: true,
        },
    );

    const inviteMemberAction = useAsyncAction(async (email: string) => {
        if (!email) throw new Error("Email is required to invite a member.");
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
        if (error.value) throw error.value;
        return data.value;
    });

    return {
        members,
        pendingFetch,
        fetchError,
        refresh,

        // Action d'invitation
        inviteMember: inviteMemberAction,
    };
};

export const useMembers = createSharedComposable(_useMembers);

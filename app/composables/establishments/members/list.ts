import { createSharedComposable } from "@vueuse/core";
import { establishmentApi } from "~/services/api/establishment.api";
import { MemberRole } from "~~/shared/domain/establishment/member.entity";

const _useMembersList = () => {
    const { establishment } = useEstablishmentDetails();

    const members = computed(() => {
        return establishment.value?.members ?? [];
    });

    const inviteMemberAction = useAsyncAction(
        async (email: string) => {
            await establishmentApi.inviteMember({
                establishmentId: establishment.value!.id,
                email,
                role: MemberRole.MEMBER,
            });
        },
    );

    return {
        members,
        actions: {
            inviteMember: inviteMemberAction,
        },
    };
};

export const useMembersList = createSharedComposable(_useMembersList);

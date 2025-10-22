import { createSharedComposable } from "@vueuse/core";
import { AppError } from "~/core/errors/app.error";
import { establishmentApi } from "~/services/api/establishment.api";
import { MemberViewModel } from "~/viewmodels/establishment/member.vm";

const _useMembersList = () => {
    const { selectedId } = useEstablishmentsList();
    const { model } = useEstablishmentDetails();
    const { currentUser } = useUser();

    const members = computed(() => {
        return model.value?.members.map((member) =>
            new MemberViewModel(member)
        ) ?? [];
    });

    const inviteMemberAction = useAsyncAction(
        async (email: string) => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.inviteMember({
                establishmentId: selectedId.value,
                email,
                invitorId: currentUser.value!.id,
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

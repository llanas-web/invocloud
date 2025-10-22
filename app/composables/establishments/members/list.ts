import { createSharedComposable } from "@vueuse/core";
import { AppError } from "~/core/errors/app.error";
import { establishmentApi } from "~/services/api/establishment.api";
import { MemberViewModel } from "~/viewmodels/establishment/member.vm";
import { MemberRole } from "~~/shared/domain/establishment/member.entity";

const _useMembersList = () => {
    const { model } = useEstablishmentDetails();

    const members = computed(() => {
        return model.value?.members.map((member) =>
            new MemberViewModel(member)
        ) ?? [];
    });

    const inviteMemberAction = useAsyncAction(
        async (email: string) => {
            if (!model.value?.id) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.inviteMember({
                establishmentId: model.value.id,
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

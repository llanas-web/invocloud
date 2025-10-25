import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";
import { establishmentApi } from "~/services/api/establishment.api";
import { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";
import { fromDate } from "~/utils/date";

const _useEstablishmentDetails = () => {
    const { $usecases } = useNuxtApp();
    const { selectedId, refresh: refreshListEstablishments } =
        useEstablishmentsList();
    const { connectedUser } = useAuth();

    const {
        data: dto,
        error,
        pending,
    } = useAsyncData(
        async () => {
            if (!selectedId.value) return null;
            return await $usecases.establishments.details.execute(
                selectedId.value,
            );
        },
        {
            immediate: false,
            default: () => null,
            watch: [selectedId],
        },
    );

    const establishment = computed(() => {
        if (!dto.value) return null;
        return {
            id: dto.value.id,
            name: dto.value.name,
            emailPrefix: dto.value.emailPrefix,
            creatorId: dto.value.creatorId,
            address: dto.value.address,
            phone: dto.value.phone,
        };
    });

    const subscription = computed(() => {
        console.log(dto.value);
        if (!dto.value?.subscription) return null;
        return {
            status: dto.value.subscription.status,
            endDate: dto.value.subscription.endAt,
            endDateLabel: dto.value.subscription.endAt
                ? fromDate(dto.value.subscription.endAt)
                : "N/A",
        };
    });

    const members = computed(() => {
        if (!dto.value) return [];
        return dto.value.members.map((member) => ({
            id: member.id,
            fullName: member.fullName,
            email: member.email,
            role: member.role,
            status: member.status,
        }));
    });

    const isSelected = computed(() => !!selectedId.value);

    const isAdmin = computed(() => {
        return establishment.value?.creatorId === connectedUser.value?.id;
    });

    const isActive = computed(() => {
        return subscription.value?.status === SubscriptionStatus.ACTIVE;
    });

    const isTrial = computed(() => {
        return subscription.value?.status === SubscriptionStatus.TRIALING;
    });

    const deleteAction = useAsyncAction(async () => {
        if (!selectedId.value) throw new AppError("No establishment selected");
        await $usecases.establishments.delete.execute([selectedId.value]);
        await refreshListEstablishments();
    });

    const createCheckoutSessionAction = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.subscription
                .createCheckoutSession({
                    establishmentId: selectedId.value,
                    userId: connectedUser.value!.id,
                });
        },
    );

    const cancelSubscriptionAction = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.subscription.cancel({
                establishmentId: selectedId.value,
            });
        },
    );

    const inviteMemberAction = useAsyncAction(
        async (email: string) => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.inviteMember({
                establishmentId: selectedId.value,
                email,
                invitorId: connectedUser.value!.id,
            });
        },
    );

    return {
        dto,
        establishment,
        subscription,
        members,
        isSelected,
        isAdmin,
        isActive,
        isTrial,
        pending,
        error,
        actions: {
            delete: deleteAction,
            createCheckoutSession: createCheckoutSessionAction,
            cancelSubscription: cancelSubscriptionAction,
            inviteMember: inviteMemberAction,
        },
    };
};

export const useEstablishmentDetails = createSharedComposable(
    _useEstablishmentDetails,
);

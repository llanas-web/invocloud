import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";
import { establishmentApi } from "~/services/api/establishment.api";
import { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";
import { fromDate } from "~/utils/date";

const _useEstablishmentDetails = () => {
    const { $usecases, $queries } = useNuxtApp();
    const { selectedId, refresh: refreshListEstablishments } =
        useEstablishmentsList();
    const { connectedUser } = useAuth();
    const toast = useToast();

    const {
        data: dto,
        error,
        pending,
        refresh,
    } = useAsyncData(
        async () => {
            try {
                if (!selectedId.value) return null;
                return await $queries.establishmentQuery
                    .getEstablishmentDetails(
                        selectedId.value,
                    );
            } catch (err) {
                const error = AppError.fromUnknownError(err);
                toast.add(error.toToastOptions());
                throw error;
            }
        },
        {
            server: false,
            immediate: true,
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

    const isInactive = computed(() => {
        return subscription.value === null ||
            subscription.value?.status === SubscriptionStatus.CANCELED;
    });

    const deleteAction = useAsyncAction(async () => {
        if (!selectedId.value) throw new AppError("No establishment selected");
        await $usecases.establishments.delete.execute({
            establishmentId: selectedId.value,
        });
        await refreshListEstablishments();
    });

    const createCheckoutSessionAction = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            const checkoutUrl = await establishmentApi.subscription
                .createCheckoutSession({
                    establishmentId: selectedId.value,
                    userId: connectedUser.value!.id,
                });
            navigateTo(checkoutUrl, { external: true });
        },
        {
            showToast: false,
            errorTitle: "Erreur lors de la création de la session de paiement.",
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
            await refresh();
        },
        {
            successTitle: "Abonnement annulé avec succès.",
            errorTitle: "Erreur lors de l'annulation de l'abonnement.",
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
            await refresh();
        },
        {
            successTitle: "Invitation envoyée avec succès.",
            errorTitle: "Erreur lors de l'envoi de l'invitation.",
        },
    );

    return {
        dto,
        establishment,
        subscription,
        members,
        isSelected,
        isAdmin,
        isInactive,
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

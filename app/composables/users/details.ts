import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";
import { userApi } from "~/services/api/user.api";
import { SubscriptionStatus } from "~~/shared/domain/user/subscription.entity";

const _useUser = () => {
    const { $usecases, $queries } = useNuxtApp();
    const { connectedUser } = useAuth();
    const { actions: { logout: logoutAction } } = useAuth();
    const toast = useToast();

    const {
        data: dto,
        error: error,
        refresh,
        pending,
    } = useAsyncData(async () => {
        try {
            if (!connectedUser.value?.id) return null;
            return $queries.userQuery.getUserDetails(
                connectedUser.value.id,
            );
        } catch (err) {
            const error = AppError.fromUnknownError(err);
            toast.add(error.toToastOptions());
            throw error;
        }
    }, {
        immediate: true,
        lazy: true,
    });

    const subscription = computed(() => {
        if (!dto.value?.subscription) return null;
        return {
            planId: dto.value.subscription.planId,
            status: dto.value.subscription.status,
            endDate: dto.value.subscription.endAt,
            endDateLabel: dto.value.subscription.endAt
                ? fromDate(dto.value.subscription.endAt, "dd MMM")
                : "N/A",
        };
    });

    const isActive = computed(() => {
        return subscription.value?.status === SubscriptionStatus.ACTIVE;
    });

    const isCanceled = computed(() => {
        return subscription.value?.status === SubscriptionStatus.CANCELED;
    });

    const userSettings = computed(() => {
        if (!dto.value) return null;
        return {
            favoriteEstablishmentId: dto.value.favoriteEstablishmentId,
        };
    });

    const deleteAccountAction = useAsyncAction(
        async () => {
            if (!connectedUser.value?.id) throw new AppError("No user id");
            await $usecases.users.delete.execute({
                userId: connectedUser.value.id,
            });
            await logoutAction.execute();
        },
        {
            successTitle: "Compte utilisateur supprimé avec succès.",
            errorTitle: "Erreur lors de la suppression du compte utilisateur.",
        },
    );

    const toggleFavoriteAction = useAsyncAction(
        async (establishmentId: string) => {
            if (!connectedUser.value?.id) throw new AppError("No user id");
            await $usecases.users.toggleFavorite.execute({
                userId: connectedUser.value.id,
                establishmentId,
            });
            await refresh();
        },
        {
            showToast: false,
            errorTitle:
                "Erreur lors de la mise à jour des préférences utilisateur.",
        },
    );

    const cancelSubscriptionAction = useAsyncAction(
        async () => {
            await userApi.subscription.cancel({
                userId: connectedUser.value!.id,
            });
            await refresh();
        },
        {
            successTitle: "Abonnement annulé avec succès.",
            errorTitle: "Erreur lors de l'annulation de l'abonnement.",
        },
    );

    const activateSubscriptionAction = useAsyncAction(
        async ({ subscriptionPlanId }: { subscriptionPlanId: string }) => {
            await userApi.subscription.activate({
                userId: connectedUser.value!.id,
                subscriptionPlanId,
            });
            await refresh();
        },
        {
            successTitle: "Abonnement activé avec succès.",
            errorTitle: "Erreur lors de l'activation de l'abonnement.",
        },
    );

    return {
        currentUser: dto,
        userSettings,
        subscription,
        isActive,
        isCanceled,
        error,
        refresh,
        pending,
        actions: {
            delete: deleteAccountAction,
            toggleFavorite: toggleFavoriteAction,
            activateSubscription: activateSubscriptionAction,
            cancelSubscription: cancelSubscriptionAction,
        },
    };
};

export const useUser = createSharedComposable(_useUser);

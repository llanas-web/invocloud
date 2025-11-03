import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";

const _useUser = () => {
    const { $usecases, $queries } = useNuxtApp();
    const { connectedUser } = useAuth();
    const { actions: { logout: logoutAction } } = useAuth();

    const {
        data: dto,
        error: error,
        refresh,
        pending,
    } = useAsyncData(async () => {
        try {
            if (!connectedUser.value?.id) return null;
            return await $queries.userQuery.getUserDetails(
                connectedUser.value.id,
            );
        } catch (err) {
            throw AppError.fromUnknownError(err);
        }
    }, {
        deep: true,
        immediate: true,
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

    return {
        currentUser: dto,
        userSettings,
        error,
        refresh,
        pending,
        actions: {
            delete: deleteAccountAction,
            toggleFavorite: toggleFavoriteAction,
        },
    };
};

export const useUser = createSharedComposable(_useUser);

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
        if (!connectedUser.value?.id) return null;
        return await $queries.userQuery.getUserDetails(connectedUser.value.id);
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

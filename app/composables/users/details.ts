import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";

const _useUser = () => {
    const { $usecases } = useNuxtApp();
    const { connectedUser } = useAuth();
    const { actions: { logout: logoutAction } } = useAuth();

    const {
        data: model,
        error: error,
        refresh,
        pending,
    } = useAsyncData(async () => {
        if (!connectedUser.value?.id) return null;
        return await $usecases.users.details.execute(connectedUser.value.id);
    }, {
        deep: true,
        immediate: true,
    });

    const userSettings = computed(() => {
        if (!model.value) return null;
        return {
            favoriteEstablishmentId: model.value.favoriteEstablishmentId,
        };
    });

    const deleteAccountAction = useAsyncAction(
        async () => {
            if (!connectedUser.value?.id) throw new AppError("No user id");
            await $usecases.users.delete.execute(connectedUser.value.id);
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
        },
    );

    return {
        currentUser: model,
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

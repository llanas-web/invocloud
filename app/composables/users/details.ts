import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";

const _useUser = () => {
    const { $usecases } = useNuxtApp();
    const { user } = useAuth();
    const { actions: { logout: logoutAction } } = useAuth();

    const {
        data: model,
        error: error,
        refresh,
        pending,
    } = useAsyncData(async () => {
        if (!user.value?.id) return null;
        return await $usecases.users.details.execute(user.value.id);
    }, {
        deep: true,
        immediate: true,
    });

    const deleteAccountAction = useAsyncAction(
        async () => {
            if (!user.value?.id) throw new AppError("No user id");
            await $usecases.users.delete.execute(user.value.id);
            await logoutAction.execute();
        },
    );

    return {
        currentUser: model,
        error,
        refresh,
        pending,
        actions: {
            delete: deleteAccountAction,
        },
    };
};

export const useUser = createSharedComposable(_useUser);

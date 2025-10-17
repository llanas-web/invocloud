import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "./core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import type { UserModelUpdate } from "~~/shared/types/models/user.model";

const _useUser = () => {
    const supabaseUser = useSupabaseUser();
    const { logout } = useAuth();

    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const userRepository = getRepository("userRepository");

    const {
        data: currentUser,
        error: error,
        refresh,
    } = useAsyncData(async () => {
        if (!supabaseUser.value?.id) return null;
        return await userRepository.getUser({
            id: supabaseUser.value.id,
        });
    }, {
        deep: true,
    });

    const updateUserAction = useAsyncAction(
        async (updates: Partial<UserModelUpdate>) => {
            if (!supabaseUser.value?.id) throw new Error("No user id");
            const newUser = await userRepository.updateUser(
                supabaseUser.value.id,
                updates,
            );
            await refresh();
            return newUser;
        },
    );

    const deleteAccountAction = useAsyncAction(async () => {
        if (!supabaseUser.value?.id) throw new Error("No user id");
        await userRepository.deleteUser(supabaseUser.value.id);
        await logout.execute();
        return true;
    });

    return {
        currentUser,
        error,
        refresh,

        updateUser: updateUserAction,
        deleteAccount: deleteAccountAction,
    };
};

export const useUser = createSharedComposable(_useUser);

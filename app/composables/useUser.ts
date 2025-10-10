import { createSharedComposable } from "@vueuse/core";
import type { UserUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";
import createUserRepository from "~~/shared/providers/database/supabase/repositories/user.repository";

const _useUser = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const { logout } = useAuth();

    const userRepository = createUserRepository(supabaseClient);

    const { data: currentUser, error, refresh } = useAsyncData(async () => {
        const { data } = await userRepository.getUserById(
            user.value!.id,
        );
        return data;
    }, {
        deep: true,
    });

    const updateUser = async (updates: Partial<UserUpdate>) => {
        const { data, error: updateError } = await userRepository.updateUser(
            user.value!.id,
            updates,
        );
        if (updateError) {
            return null;
        }
        await refresh();
        return data;
    };

    const deleteAccount = async () => {
        const success = await userRepository.deleteUser(
            user.value!.id,
        );
        if (!success) {
            return false;
        }
        console.log("Account deleted successfully:", success);
        await logout();
        return true;
    };

    return {
        currentUser,
        error,
        refresh,
        updateUser,
        deleteAccount,
    };
};

export const useUser = createSharedComposable(_useUser);

import { createSharedComposable } from "@vueuse/core";
import createUserRepository from "~~/shared/providers/database/supabase/repositories/user.repository";

const defaultUserSettings = {
    favorite_establishment_id: null,
};

export const _useUserSettings = () => {
    const supabase = useSupabaseClient();
    const userRepository = createUserRepository(supabase);
    const user = useSupabaseUser();

    const { data: userSettings, error, refresh } = useAsyncData(
        "userSettings",
        async () => {
            console.log("Fetching user settings for user:", user.value?.id);
            const { data, error } = await userRepository.getUserSettings(
                user.value!.id,
            );
            if (error && !data) {
                return defaultUserSettings;
            }
            return data;
        },
        {
            default: () => defaultUserSettings,
            watch: [user],
            server: false,
        },
    );

    const toggleFavorite = async (establishmentId: string) => {
        if (userSettings.value.favorite_establishment_id === establishmentId) {
            await userRepository.updateUserSettings(user.value!.id, {
                favorite_establishment_id: null,
            });
            userSettings.value.favorite_establishment_id = null;
        } else {
            await userRepository.updateUserSettings(user.value!.id, {
                favorite_establishment_id: establishmentId,
            });
        }
        await refresh();
    };

    return {
        userSettings,
        error,
        refresh,
        toggleFavorite,
    };
};

export const useUserSettings = createSharedComposable(_useUserSettings);

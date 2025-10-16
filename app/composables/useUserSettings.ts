import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "./core/useAsyncAction";
import DatabaseFactory from "~~/shared/providers/database/database.factory";

const defaultUserSettings = {
    favorite_establishment_id: null,
};

export const _useUserSettings = () => {
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const userRepository = getRepository("userRepository");
    const user = useSupabaseUser();

    const { data: userSettings, error, pending, refresh } = useAsyncData(
        "userSettings",
        async () => {
            return await userRepository.getUserSettings(
                user.value!.id,
            );
        },
        {
            default: () => defaultUserSettings,
            watch: [user],
            server: false,
        },
    );

    const toggleFavoriteAction = useAsyncAction(
        async (establishmentId: string) => {
            if (!user.value?.id) throw new Error("No user id");
            const newUserSettings = await userRepository.upsertUserSettings(
                user.value.id,
                {
                    favorite_establishment_id:
                        userSettings.value.favorite_establishment_id ===
                                establishmentId
                            ? null
                            : establishmentId,
                },
            );
            userSettings.value = newUserSettings;
            await refresh();
            return userSettings.value;
        },
    );

    return {
        userSettings,
        error,
        pending,
        refresh,

        toggleFavorite: toggleFavoriteAction,
    };
};

export const useUserSettings = createSharedComposable(_useUserSettings);

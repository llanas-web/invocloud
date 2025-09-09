import { createSharedComposable } from "@vueuse/core";

const defaultUserSettings = {
    favorite_establishment_id: null,
};

export const _useUserSettings = () => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();

    const { data: userSettings, error, refresh } = useAsyncData(
        "userSettings",
        async () => {
            console.log("Fetching user settings for user:", user.value?.id);
            const { data, error } = await supabase
                .from("user_settings")
                .select("favorite_establishment_id")
                .eq("user_id", user.value!.id)
                .single();

            console.log(data, error);

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
            // unset
            await supabase.from("user_settings").update({
                favorite_establishment_id: null,
            }).eq("user_id", user.value!.id);
            userSettings.value.favorite_establishment_id = null;
        } else {
            // set
            await supabase.from("user_settings").upsert({
                user_id: user.value!.id,
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

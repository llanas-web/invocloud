import { createSharedComposable } from "@vueuse/core";
import type { UserUpdate } from "~/types";

const _useUser = () => {
    const supabaseClient = useSupabaseClient();
    const user = useSupabaseUser();

    const { data: currentUser, error, refresh } = useAsyncData(async () => {
        const { data } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", user.value!.id)
            .single();

        return data;
    });

    const updateUser = async (updates: Partial<UserUpdate>) => {
        const { data, error: updateError } = await supabaseClient
            .from("users")
            .update(updates)
            .eq("id", user.value!.id);
        if (updateError) {
            console.error("Error updating user:", updateError);
            return null;
        }
        await refresh();
        return data;
    };

    return {
        currentUser,
        error,
        refresh,
        updateUser,
    };
};

export const useUser = createSharedComposable(_useUser);

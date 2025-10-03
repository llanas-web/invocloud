import type { User, UserSettings, UserUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const createUserRepository = (supabase: SupabaseClient<Database>) => {
    const getUserById = async (
        id: string,
        params: (keyof User | "*")[] = ["*"],
    ) => {
        const userResponse = await supabase
            .from("users")
            .select(params.join(", "))
            .eq("id", id)
            .single();
        if (userResponse.error) {
            console.error("Error fetching user by ID:", userResponse.error);
        }
        return userResponse;
    };

    const updateUser = async (id: string, updates: Partial<UserUpdate>) => {
        const userResponse = await supabase
            .from("users")
            .update(updates)
            .eq("id", id)
            .select();
        if (userResponse.error) {
            console.error("Error updating user:", userResponse.error);
        }
        return userResponse;
    };

    const getUserByEmail = async (
        email: string,
        params: (keyof User | "*")[] = ["*"],
    ) => {
        const userResponse = await supabase
            .from("users")
            .select(params.join(", "))
            .eq("email", email)
            .single();
        if (userResponse.error) {
            console.error("Error fetching user by email:", userResponse.error);
        }
        return userResponse;
    };

    const deleteUser = async (id: string) => {
        const userResponse = await useFetch<
            ReturnType<
                typeof import("~~/server/api/user/delete-account.post").default
            >
        >("/api/user/delete-account", {
            method: "POST",
        });
        if (userResponse.error) {
            console.error("Error deleting account:", userResponse.error);
            return false;
        }
        return true;
    };

    const getUserSettings = async (id: string) => {
        const response = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", id)
            .single();
        if (response.error) {
            console.error("Error fetching user settings:", response.error);
        }
        return response;
    };

    const updateUserSettings = async (
        id: string,
        settings: Partial<UserSettings>,
    ) => {
        const response = await supabase
            .from("user_settings")
            .update(settings)
            .eq("user_id", id);
        if (response.error) {
            console.error("Error updating user settings:", response.error);
        }
        return response;
    };

    return {
        getUserById,
        updateUser,
        getUserByEmail,
        deleteUser,
        getUserSettings,
        updateUserSettings,
    };
};

export default createUserRepository;

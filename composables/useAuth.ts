import { createSharedComposable } from "@vueuse/core";

const _useAuth = () => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const session = useSupabaseSession();
    const config = useRuntimeConfig();
    const redirectTo = `${config.public.baseUrl}/auth/callback`;
    const toast = useToast();

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            toast.add({
                title: "Erreur lors de la connexion",
                description: error.message,
                color: "error",
            });
        } else navigateTo("/app");
        return { data, error };
    };

    const signup = async (
        email: string,
        password: string,
        establishment_name: string,
        full_name: string,
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: redirectTo,
                data: {
                    full_name,
                    establishment_name,
                },
            },
        });
        console.log("Signup data:", data);
        console.log("Signup error:", error);
        if (error) {
            toast.add({
                title: "Erreur lors de l'inscription",
                description: error.message,
                color: "error",
            });
            return null;
        }
        return data;
    };

    const resetPassword = async (newPassword: string) => {
        const { data, error } = await useFetch("/api/user/reset-password", {
            method: "POST",
            body: {
                password: newPassword,
            },
        });
        if (error.value) {
            toast.add({
                title: "Erreur lors de la réinitialisation du mot de passe",
                color: "error",
            });
            return null;
        }
        toast.add({
            title: "Mot de passe réinitialisé",
            color: "success",
        });
        return true;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) navigateTo("/auth/login");
        else console.error("Error logging out:", error);
    };

    return {
        user,
        session,
        login,
        signup,
        resetPassword,
        logout,
    };
};

export const useAuth = createSharedComposable(_useAuth);

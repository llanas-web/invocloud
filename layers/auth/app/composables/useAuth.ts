import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "~/composables/core/useAsyncAction";
import SupabaseAuthRepository from "~~/shared/providers/auth/supabase/auth.repository";
import {
    AuthEvent,
    AuthUserModel,
} from "~~/shared/types/models/auth-user.model";
import type { ApiResetPassword } from "~~/server/types/endpoints";

const _useAuth = () => {
    const authRepository = inject("authFactory") as SupabaseAuthRepository;
    const user = useSupabaseUser();
    const session = useSupabaseSession();
    const config = useRuntimeConfig();
    const redirectTo = `${config.public.baseUrl}/auth/callback`;

    const connectedUser = ref<AuthUserModel | null>(null);

    const handleAuthEvent = (event: AuthEvent, user: AuthUserModel | null) => {
        switch (event) {
            case AuthEvent.PASSWORD_RECOVERY:
                navigateTo("/app/settings/security");
                break;
            case AuthEvent.SIGNED_IN:
                connectedUser.value = user!;
                navigateTo("/app");
                break;
            case AuthEvent.SIGNED_OUT:
                connectedUser.value = null;
                navigateTo("/auth/login");
                break;
        }
    };

    watchEffect(() => {
        authRepository.onAuthChange(handleAuthEvent);
    });

    const login = useAsyncAction(async (email: string, password: string) => {
        const response = await authRepository.signInWithPassword(
            email,
            password,
        );
        return response;
    });

    const signup = useAsyncAction(async (
        email: string,
        password: string,
        establishment_name: string,
        full_name: string,
    ) => {
        const response = await authRepository.signUpWithPassword(
            email,
            password,
            {
                emailRedirectTo: redirectTo,
                data: {
                    full_name,
                    establishment_name,
                },
            },
        );
        return response;
    });

    const resetPassword = useAsyncAction(async (newPassword: string) => {
        const { data, error } = await useFetch<ApiResetPassword>(
            "/api/user/reset-password",
            {
                method: "POST",
                body: {
                    password: newPassword,
                },
            },
        );
        if (error.value) {
            throw new Error(error.value.message);
        }
        return data;
    });

    const logout = useAsyncAction(async () => {
        await authRepository.signOut();
        localStorage.removeItem("selectedEstablishment");
    });

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

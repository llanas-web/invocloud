import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "~/composables/core/useAsyncAction";
import type {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/application/common/providers/auth/dto/auth.dto";
import { AuthEvent } from "~~/shared/application/common/providers/auth/types";

const _useAuth = () => {
    const config = useRuntimeConfig();
    const authRepository = useNuxtApp().$authRepository;
    const redirectTo = `${config.public.baseUrl}/auth/callback`;

    const connectedUser = ref<AuthUserModel | AnonymousAuthUserModel | null>(
        null,
    );

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

    const loginAction = useAsyncAction(
        async (email: string, password: string) => {
            const response = await authRepository.signInWithPassword(
                email,
                password,
            );
            return response;
        },
    );

    const signupAction = useAsyncAction(async (
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

    const resetPasswordAction = useAsyncAction(async (newPassword: string) => {
        const { data, error } = await useFetch(
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

    const logoutAction = useAsyncAction(async () => {
        await authRepository.signOut();
        localStorage.removeItem("selectedEstablishment");
    });

    return {
        connectedUser,
        actions: {
            login: loginAction,
            signup: signupAction,
            resetPassword: resetPasswordAction,
            logout: logoutAction,
        },
    };
};

export const useAuth = createSharedComposable(_useAuth);

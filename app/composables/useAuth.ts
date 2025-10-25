import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "~/composables/core/useAsyncAction";

const _useAuth = () => {
    const config = useRuntimeConfig();
    const authRepository = useNuxtApp().$authRepository;
    const redirectTo = `${config.public.baseUrl}/auth/callback`;

    const connectedUser = computed(() => authRepository.connectedUser);

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

    const sendResetPasswordEmailAction = useAsyncAction(
        async (email: string) => {
            authRepository.sendPasswordResetEmail(email);
        },
    );

    const logoutAction = useAsyncAction(async () => {
        await authRepository.signOut();
        localStorage.removeItem("selectedEstablishment");
    });

    return {
        connectedUser,
        actions: {
            login: loginAction,
            signup: signupAction,
            sendResetPasswordEmail: sendResetPasswordEmailAction,
            resetPassword: resetPasswordAction,
            logout: logoutAction,
        },
    };
};

export const useAuth = createSharedComposable(_useAuth);

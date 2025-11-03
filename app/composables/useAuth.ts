import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "~/composables/core/useAsyncAction";
import { userApi } from "~/services/api/user.api";

const _useAuth = () => {
    const config = useRuntimeConfig();
    const authRepository = useNuxtApp().$authRepository;
    const redirectTo = `${config.public.baseUrl}/auth/callback`;

    const connectedUser = computed(() => authRepository.connectedUser);

    const isAuthenticated = computed(() => {
        return connectedUser.value !== null;
    });

    const loginAction = useAsyncAction(
        async (email: string, password: string) => {
            const response = await authRepository.signInWithPassword(
                email,
                password,
            );
            return response;
        },
        {
            showToast: false,
            errorTitle: "Erreur lors de la connexion.",
        },
    );

    const signupAction = useAsyncAction(
        async (
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
        },
        {
            showToast: false,
            errorTitle: "Erreur lors de l'inscription.",
        },
    );

    const resetPasswordAction = useAsyncAction(
        async (newPassword: string) => {
            await userApi.resetPassword({
                password: newPassword,
            });
        },
        {
            successTitle: "Mot de passe réinitialisé avec succès.",
            errorTitle: "Erreur lors de la réinitialisation du mot de passe.",
        },
    );

    const sendResetPasswordEmailAction = useAsyncAction(
        async (email: string) => {
            authRepository.sendPasswordResetEmail(email);
        },
        {
            successTitle:
                "E-mail de réinitialisation du mot de passe envoyé avec succès.",
            errorTitle:
                "Erreur lors de l'envoi de l'e-mail de réinitialisation du mot de passe.",
        },
    );

    const logoutAction = useAsyncAction(
        async () => {
            await authRepository.signOut();
            localStorage.removeItem("selectedEstablishment");
        },
        {
            showToast: false,
            errorTitle: "Erreur lors de la déconnexion.",
        },
    );

    return {
        connectedUser,
        isAuthenticated,
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

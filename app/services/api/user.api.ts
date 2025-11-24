import {
    type ResetPasswordBody,
    ResetPasswordBodySchema,
} from "#shared/contracts/api/security/users/reset-password.contract";

export const userApi = {
    resetPassword(body: ResetPasswordBody) {
        return $fetch<void>(
            "/api/security/user/reset-password",
            {
                method: "POST",
                body: parseBody(ResetPasswordBodySchema, body),
            },
        );
    },
    subscription: {
        createCheckoutSession(
            data: { userId: string; plan: "starter" | "pro" },
        ) {
            return $fetch<string>(
                "/api/security/user/subscription/create-checkout",
                {
                    method: "POST",
                    body: data,
                },
            );
        },
        cancel(data: { userId: string }) {
            return $fetch<void>(
                "/api/security/user/subscription/cancel",
                {
                    method: "POST",
                    body: data,
                },
            );
        },
    },
};

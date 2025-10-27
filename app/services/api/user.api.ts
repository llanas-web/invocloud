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
};

import {
    type ResetPasswordBody,
    ResetPasswordBodySchema,
} from "#shared/contracts/api/security/users/reset-password.contract";
import {
    type DeleteAccountBody,
    DeleteAccountBodySchema,
} from "~~/shared/contracts/api/security/users/delete-account.contract";

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
    deleteAccount(body: DeleteAccountBody) {
        return $fetch<void>(
            "/api/security/user/delete-account",
            {
                method: "POST",
                body: parseBody(DeleteAccountBodySchema, body),
            },
        );
    },
};

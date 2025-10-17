type ApiResetPassword = ReturnType<
    typeof import("~~/server/api/security/user/reset-password.post").default
>;
type ApiMemberInvite = ReturnType<
    typeof import("~~/server/api/security/establishment/invite-member.post").default
>;
export { ApiMemberInvite, ApiResetPassword };

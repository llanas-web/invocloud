import {
    type InviteMemberBody,
    InviteMemberBodySchema,
    type InviteMemberResponse,
} from "~~/shared/contracts/api/security/establishments/invite-member.contract";

export const establishmentApi = {
    inviteMember(body: InviteMemberBody) {
        return $fetch<InviteMemberResponse>(
            "/api/security/establishment/invite-member",
            {
                method: "POST",
                body: parseBody(InviteMemberBodySchema, body),
            },
        );
    },
};

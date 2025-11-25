import {
    type InviteMemberBody,
    InviteMemberBodySchema,
    type InviteMemberResponse,
} from "~~/shared/contracts/api/security/establishments/invite-member.contract";
import {
    type CancelSubscriptionBody,
    CancelSubscriptionBodySchema,
} from "~~/shared/contracts/api/security/users/subscription/cancel.contract";
import {
    type CreateCheckoutSessionBody,
    CreateCheckoutSessionBodySchema,
} from "~~/shared/contracts/api/security/users/subscription/create-checkout.contract";

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
    checkPrefix(prefix: string, excludeEstablishmentId?: string) {
        return $fetch<{ isAvailable: boolean }>(
            "/api/security/establishment/check-prefix",
            {
                method: "POST",
                body: { prefix, excludeEstablishmentId },
            },
        );
    },
};

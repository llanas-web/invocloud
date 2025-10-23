import {
    type InviteMemberBody,
    InviteMemberBodySchema,
    type InviteMemberResponse,
} from "~~/shared/contracts/api/security/establishments/invite-member.contract";
import {
    type CancelSubscriptionBody,
    CancelSubscriptionBodySchema,
} from "~~/shared/contracts/api/security/establishments/subscription/cancel.contract";
import {
    type CreateCheckoutSessionBody,
    CreateCheckoutSessionBodySchema,
} from "~~/shared/contracts/api/security/establishments/subscription/create-checkout.contract";

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
    subscription: {
        createCheckoutSession(body: CreateCheckoutSessionBody) {
            return $fetch<string>(
                "/api/security/establishment/subscription/create-checkout",
                {
                    method: "POST",
                    body: parseBody(CreateCheckoutSessionBodySchema, body),
                },
            );
        },
        cancel(body: CancelSubscriptionBody) {
            return $fetch<string>(
                "/api/security/establishment/subscription/cancel",
                {
                    method: "POST",
                    body: parseBody(CancelSubscriptionBodySchema, body),
                },
            );
        },
    },
};

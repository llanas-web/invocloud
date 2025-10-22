import { z } from "zod";
import { MemberRole } from "~~/shared/domain/establishment/member.entity";

export const InviteMemberBodySchema = z.object({
    establishmentId: z.uuid(),
    email: z.email().max(255),
    invitorId: z.uuid(),
});

export const InviteMemberResponseSchema = z.undefined();

export type InviteMemberBody = z.infer<typeof InviteMemberBodySchema>;
export type InviteMemberResponse = z.infer<typeof InviteMemberResponseSchema>;

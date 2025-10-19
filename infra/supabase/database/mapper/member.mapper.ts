import {
    MemberModel,
    MemberRole,
    MemberStatus,
} from "~~/shared/types/models/member.model";
import { UserModel } from "~~/shared/types/models/user.model";
import { fromStringToLocalDate } from "~~/shared/utils/date.utils";
import type { EstablishmentMember } from "~~/shared/types/providers/database";

export const memberMapperFromDatabase = (
    member: EstablishmentMember,
    user: UserModel,
): MemberModel => {
    return new MemberModel(
        member.establishment_id,
        user,
        member.role as MemberRole,
        fromStringToLocalDate(member.created_at),
        member.status as MemberStatus,
    );
};

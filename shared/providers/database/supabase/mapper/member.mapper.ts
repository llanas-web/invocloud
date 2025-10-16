import {
    MemberModel,
    MemberRole,
    MemberStatus,
} from "~~/shared/types/models/member.model";
import { UserModel } from "~~/shared/types/models/user.model";
import { fromStringToLocalDate } from "~~/shared/utils/date.utils";
import type { EstablishmentMember, User } from "~~/types/providers/database";
import { userMapperFromDatabase } from "./user.mapper";

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

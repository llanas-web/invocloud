import { UserModel } from "~~/shared/types/models/user.model";
import { fromStringToLocalDate } from "#shared/utils/date.utils";
import type { User } from "~~/types/providers/database";

export const userMapperFromDatabase = (
    data: User,
): UserModel => {
    return new UserModel(
        data.id,
        data.email,
        fromStringToLocalDate(data.created_at),
        fromStringToLocalDate(data.updated_at),
        data.full_name,
    );
};

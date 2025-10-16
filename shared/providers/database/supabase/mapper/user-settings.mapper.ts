import UserSettingsModel from "~~/shared/types/models/user-settings.model";
import type { UserSettings } from "~~/types/providers/database";

export const userSettingsMapperFromDatabase = (
    dbRecord: UserSettings,
): UserSettingsModel => {
    return new UserSettingsModel({
        userId: dbRecord.user_id,
        favorite_establishment_id: dbRecord.favorite_establishment_id,
    });
};

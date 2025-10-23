import type { DraftUser, UserModel } from "./user.model";

export interface UserRepository {
    getById(id: string): Promise<UserModel | null>;
    create(entity: DraftUser): Promise<string>;
    update(entity: UserModel): Promise<void>;
    delete(id: string): Promise<void>;
}

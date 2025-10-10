import { UserModel } from "./user.model";

export enum MemberStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
}

export enum MemberRole {
    CREATOR = "creator",
    ADMIN = "admin",
}

export class MemberModel {
    establishmentId: string;
    user: UserModel;
    role: MemberRole;
    joinedAt: Date;
    status: MemberStatus;

    constructor(
        establishmentId: string,
        user: UserModel,
        role: MemberRole,
        joinedAt: Date,
        status: MemberStatus,
    ) {
        this.establishmentId = establishmentId;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
        this.status = status;
    }
}

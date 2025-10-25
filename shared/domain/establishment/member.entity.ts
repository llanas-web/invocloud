import type { UserModel } from "~~/shared/domain/user/user.model";
import type { ModelCommonProps } from "../common/common.interface";

export enum MemberStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
}

export enum MemberRole {
    CREATOR = "creator",
    ADMIN = "admin",
}

export type MemberEntityProps = {
    userId: string;
    role: MemberRole;
    status: MemberStatus;
    createdAt?: Date;
};

/**
 * Entity membre - fait partie de l'aggregate Establishment
 * N'existe jamais sans un Establishment
 */
class MemberEntity {
    private constructor(readonly props: MemberEntityProps) {}

    static create(props: MemberEntityProps): MemberEntity {
        return new MemberEntity(props);
    }

    static createPending(userId: string): MemberEntity {
        return new MemberEntity({
            userId,
            role: MemberRole.ADMIN,
            status: MemberStatus.PENDING,
            createdAt: new Date(),
        });
    }

    static createFromUserId(
        userId: string,
        status: MemberStatus = MemberStatus.PENDING,
    ): MemberEntity {
        return new MemberEntity({
            userId,
            role: MemberRole.ADMIN,
            status,
        });
    }

    get userId() {
        return this.props.userId;
    }

    get role() {
        return this.props.role;
    }

    get status() {
        return this.props.status;
    }

    isPending(): boolean {
        return this.props.status === MemberStatus.PENDING;
    }

    isAccepted(): boolean {
        return this.props.status === MemberStatus.ACCEPTED;
    }

    accept(): MemberEntity {
        if (this.props.status !== MemberStatus.PENDING) {
            throw new Error(
                "Seuls les membres en attente peuvent être acceptés",
            );
        }
        return new MemberEntity({
            ...this.props,
            status: MemberStatus.ACCEPTED,
        });
    }

    decline(): MemberEntity {
        if (this.props.status !== MemberStatus.PENDING) {
            throw new Error(
                "Seuls les membres en attente peuvent être refusés",
            );
        }
        return new MemberEntity({
            ...this.props,
            status: MemberStatus.DECLINED,
        });
    }

    promoteToAdmin(): MemberEntity {
        return new MemberEntity({
            ...this.props,
            role: MemberRole.ADMIN,
        });
    }
}

export default MemberEntity;

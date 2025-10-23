import type { MemberDTO } from "~~/shared/application/establishment/dto";
import {
    MemberRole,
    MemberStatus,
} from "~~/shared/domain/establishment/member.entity";

export class MemberViewModel {
    constructor(private member: MemberDTO) {}

    get id(): string {
        return this.member.id;
    }

    get fullName(): string | null {
        return this.member.fullName;
    }

    get email(): string {
        return this.member.email;
    }

    getRoleLabel(): string {
        switch (this.member.role) {
            case MemberRole.ADMIN:
                return "Administrator";
            // case MemberRole.CREATOR:
            //     return "Créateur";
            default:
                return "Unknown";
        }
    }

    getStatusLabel(): string {
        switch (this.member.status) {
            case MemberStatus.ACCEPTED:
                return "Actif";
            case MemberStatus.PENDING:
                return "En attente";
            case MemberStatus.DECLINED:
                return "Refusé";
            default:
                return "Unknown";
        }
    }

    getStatusColor():
        | "error"
        | "success"
        | "primary"
        | "secondary"
        | "info"
        | "warning"
        | "neutral"
        | undefined {
        switch (this.member.status) {
            case MemberStatus.ACCEPTED:
                return "success";
            case MemberStatus.PENDING:
                return "warning";
            case MemberStatus.DECLINED:
                return "error";
            default:
                return "primary";
        }
    }
}

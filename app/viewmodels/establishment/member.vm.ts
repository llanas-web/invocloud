import {
    type MemberEntity,
    MemberRole,
    MemberStatus,
} from "~~/shared/domain/establishment/member.entity";

export class MemberViewModel {
    constructor(private member: MemberEntity) {}

    getRoleLabel(): string {
        switch (this.member.role) {
            case MemberRole.ADMIN:
                return "Administrator";
            case MemberRole.MEMBER:
                return "Membre";
            case MemberRole.CREATOR:
                return "Créateur";
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
}

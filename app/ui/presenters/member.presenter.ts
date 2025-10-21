import type { MemberDTO } from "~~/shared/application/establishment/dto";
import {
    MemberRole,
    MemberStatus,
} from "~~/shared/domain/establishment/member.entity";

export type MemberVM = {
    userId: string;
    fullName: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;

    roleLabel?: string;
    statusLabel?: string;
};

function getRoleLabel(role: MemberRole): string {
    switch (role) {
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

function getStatusLabel(status: MemberStatus): string {
    switch (status) {
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

export function presentMember(
    member: MemberDTO,
    opts?: { locale?: string },
): MemberVM {
    const locale = opts?.locale ?? "fr-FR";
    return {
        userId: member.userId,
        fullName: member.fullName ?? "N/A",
        email: member.email,
        role: member.role,
        status: member.status,
        roleLabel: getRoleLabel(member.role),
        statusLabel: getStatusLabel(member.status),
    };
}

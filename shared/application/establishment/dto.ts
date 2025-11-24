import type {
    MemberRole,
    MemberStatus,
} from "~~/shared/domain/establishment/member.entity";

export type EstablishmentListItemDTO = {
    id: string;
    name: string;
    emailPrefix: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type MemberDTO = {
    id: string;
    fullName: string | null;
    email: string;
    role: MemberRole.ADMIN;
    status: MemberStatus;
};

export type EstablishmentDetailsDTO = {
    id: string;
    name: string;
    emailPrefix: string;
    address: string | null;
    phone: string | null;
    creatorId: string;
    members: MemberDTO[];
};

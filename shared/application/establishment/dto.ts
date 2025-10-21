import type {
    MemberRole,
    MemberStatus,
} from "~~/shared/types/models/member.model";

export type EstablishmentDetailsDTO = {
    id: string;
    name: string;
    emailPrefix: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    address: string | null;
    phone: string | null;
    members: MemberDTO[];
};

export type MemberDTO = {
    userId: string;
    email: string;
    fullName: string | null;
    role: MemberRole;
    status: MemberStatus;
};

export type EstablishmentListItemDTO = {
    id: string;
    name: string;
    emailPrefix: string;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
};

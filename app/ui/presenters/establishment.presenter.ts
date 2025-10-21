import type {
    EstablishmentDetailsDTO,
    EstablishmentListItemDTO,
} from "~~/shared/application/establishment/dto";
import { fmtDate } from "./format";
import { type MemberVM, presentMember } from "./member.presenter";

export type EstablishmentVM = {
    id: string;
    name: string;
    creatorId: string;
    emailPrefix: string;
    createdAtLabel: string;
    updatedAtLabel: string;
};

export function presentEstablishment(
    e: EstablishmentListItemDTO,
    opts?: { locale?: string },
): EstablishmentVM {
    const locale = opts?.locale ?? "fr-FR";
    return {
        id: e.id,
        name: e.name,
        creatorId: e.creatorId,
        emailPrefix: e.emailPrefix,
        createdAtLabel: fmtDate(e.createdAt, locale),
        updatedAtLabel: fmtDate(e.updatedAt, locale),
    };
}

export function presentEstablishments(
    establishments: EstablishmentListItemDTO[],
    opts?: { locale?: string },
): EstablishmentVM[] {
    return establishments.map((e) => presentEstablishment(e, opts));
}

export type EstablishmentDetailsVM = EstablishmentVM & {
    address: string | null;
    phone: string | null;
    members: Array<MemberVM>;
};

export function presentEstablishmentDetails(
    e: EstablishmentDetailsDTO,
    opts?: { locale?: string },
): EstablishmentDetailsVM {
    const locale = opts?.locale ?? "fr-FR";
    return {
        ...presentEstablishment(e, { locale }),
        address: e.address,
        phone: e.phone,
        members: e.members.map((m) => presentMember(m, { locale })),
    };
}

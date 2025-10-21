import type { EstablishmentListItemDTO } from "~~/shared/application/establishment/queries/establishment-list.query";
import { fmtDate } from "./format";

export type EstablishmentVM = {
    id: string;
    name: string;
    creatorId: string;
    emailPrefix: string;
    createdAtLabel: string;
    updatedAtLabel: string;
    address: string | null;
    phone: string | null;
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
        address: e.address,
        phone: e.phone,
    };
}

export function presentEstablishments(
    establishments: EstablishmentListItemDTO[],
    opts?: { locale?: string },
): EstablishmentVM[] {
    return establishments.map((e) => presentEstablishment(e, opts));
}
